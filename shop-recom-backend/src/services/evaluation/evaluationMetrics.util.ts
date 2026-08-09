// NDCG@K for binary relevance: 1 if the recommended slot matches any target id, else 0.
// idSets[i] holds every id (Mongo _id and/or business shopId) that could identify the shop
// recommended at rank i, since the rest of the codebase treats those as interchangeable.
export function ndcgAtK(idSets: string[][], targets: string[], k: number): number {
    const slice = idSets.slice(0, k);
    let dcg = 0;
    slice.forEach((ids, idx) => {
        const relevant = ids.some(id => targets.includes(id)) ? 1 : 0;
        dcg += relevant / Math.log2(idx + 2); // idx 0 -> rank 1 -> log2(2)
    });

    const idealHits = Math.min(targets.length, k);
    let idcg = 0;
    for (let i = 0; i < idealHits; i++) {
        idcg += 1 / Math.log2(i + 2);
    }

    return idcg > 0 ? dcg / idcg : 0;
}

export function shuffleArray<T>(input: T[]): T[] {
    const arr = [...input];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export interface WilcoxonResult {
    n: number;          // number of non-zero paired differences the test is based on
    statistic: number;  // W, the smaller of the summed positive/negative signed ranks
    zScore: number;
    pValue: number;     // two-tailed, normal approximation
    significant: boolean;       // pValue < 0.05 (uncorrected)
    significantCorrected: boolean; // pValue < bonferroniAlpha
}

// Standard normal CDF via the Abramowitz & Stegun approximation (accurate to ~1e-7).
function normalCdf(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z >= 0 ? 1 - prob : prob;
}

/**
 * Paired Wilcoxon signed-rank test with a normal approximation for the p-value -- appropriate
 * here because per-user precision/recall/NDCG pairs are not normally distributed, ruling out a
 * paired t-test. The normal approximation is standard practice once n is roughly >= 10; below
 * that the p-value is reported but should be read as indicative rather than exact.
 */
export function wilcoxonSignedRank(a: number[], b: number[], bonferroniAlpha: number = 0.05): WilcoxonResult {
    if (a.length !== b.length) {
        throw new Error("wilcoxonSignedRank: paired arrays must be the same length");
    }

    const diffs = a.map((v, i) => v - b[i]).filter(d => d !== 0);
    const n = diffs.length;
    if (n === 0) {
        return { n: 0, statistic: 0, zScore: 0, pValue: 1, significant: false, significantCorrected: false };
    }

    const abs = diffs.map(d => Math.abs(d));
    const order = abs.map((_, i) => i).sort((i, j) => abs[i] - abs[j]);

    const ranks = new Array(n).fill(0);
    let i = 0;
    while (i < n) {
        let j = i;
        while (j < n - 1 && abs[order[j + 1]] === abs[order[i]]) j++;
        const avgRank = (i + j) / 2 + 1; // 1-indexed average rank across the tie block
        for (let m = i; m <= j; m++) ranks[order[m]] = avgRank;
        i = j + 1;
    }

    let wPlus = 0;
    let wMinus = 0;
    diffs.forEach((d, idx) => {
        if (d > 0) wPlus += ranks[idx];
        else wMinus += ranks[idx];
    });

    const W = Math.min(wPlus, wMinus);
    const meanW = (n * (n + 1)) / 4;
    const stdW = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24);
    const zScore = stdW > 0 ? (W - meanW) / stdW : 0;
    const pValue = stdW > 0 ? 2 * (1 - normalCdf(Math.abs(zScore))) : 1;

    return {
        n,
        statistic: W,
        zScore,
        pValue,
        significant: pValue < 0.05,
        significantCorrected: pValue < bonferroniAlpha
    };
}
