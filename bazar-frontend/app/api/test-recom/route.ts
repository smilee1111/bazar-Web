import { NextResponse } from "next/server";
import { handleGetRecommendations } from "@/lib/actions/recommendation-action";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "27.7");
    const lng = parseFloat(searchParams.get("lng") || "85.32");
    
    try {
        const result = await handleGetRecommendations(lat, lng);
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
