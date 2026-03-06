import http from "http";
import https from "https";
import { HttpError } from "../../errors/http-error";
import { OSRM_BASE_URL } from "../../config";

export interface OsrmRouteResult {
    distance: number; // meters
    duration: number; // seconds
    geometry: any; // GeoJSON or polyline depending on options
}

export class OsrmService {
    async getRoute(fromLng: number, fromLat: number, toLng: number, toLat: number): Promise<OsrmRouteResult> {
        const coordinates = `${fromLng},${fromLat};${toLng},${toLat}`;
        const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

        const data = await new Promise<any>((resolve, reject) => {
            const client = url.startsWith("https") ? https : http;
            client
                .get(url, (res) => {
                    let raw = "";
                    res.on("data", (chunk) => {
                        raw += chunk;
                    });
                    res.on("end", () => {
                        if (!res.statusCode || res.statusCode >= 400) {
                            reject(new HttpError(502, "Failed to fetch route from OSRM"));
                            return;
                        }
                        try {
                            resolve(JSON.parse(raw));
                        } catch (error) {
                            reject(new HttpError(502, "Invalid response from OSRM"));
                        }
                    });
                })
                .on("error", () => {
                    reject(new HttpError(502, "Failed to reach OSRM"));
                });
        });
        if (!data?.routes?.length) {
            throw new HttpError(404, "No route found");
        }

        const route = data.routes[0];
        return {
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry,
        };
    }
}
