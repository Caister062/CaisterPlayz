import { ofetch } from 'ofetch';
import type { ApiResponse, GeoCoordinates, RadarFrame, OfficialDataSource } from '../types/weather.types.js';

export interface ECCCObsProperties {
  temperature?: number;
  dewPoint?: number;
  windSpeed?: number;
  windDirection?: number;
  pressure?: number;
  visibility?: number;
  condition?: string;
  recentPrecipitation?: { oneHour?: number; threeHour?: number; twelveHour?: number };
}

export interface ECCCClientResponse {
  metadata: Record<string, unknown>;
  observations: Array<ECCCObsProperties>;
  links?: Record<string, unknown>
}

/**
 * Service wrapper for Environment and Climate Change Canada (ECCC) weather API.
 *
 * Documentation: https://dd.weather.gc.ca/doc/API_clim_e.html (climate data)
 *                https://api.meteo.gc.ca/ (forecasts & radar)
 */
export class ECCCService {
  static readonly API_BASE = 'https://api.ec.gc.com/meteo.gc.ca';

  /**
   * Fetch climate station observations.
   * Station IDs can be found at: https://eccc-msc.github.io/open-data/msc-data/obs-elev/en-
   */
  static async getClimateStation(
    stationId: string,
  ): Promise<ApiResponse<ECCCObsData>> {
    const url = `https://dd.weather.gc.ca/city/gateway/geo/coord/point/${stationId}.json`;
    const response = await ofetch(url);
    return {
      data: response as unknown as ECCCObsData,
      source: 'ECCC' as OfficialDataSource,
      timestamp: new Date().toISOString(),
      cached: false,
    };
  }

  /**
   * Search for a station by name using the ECCC city finder.
   */
  static async searchStation(
    name: string,
  ): Promise<Array<{ id: string; name: string; coords: GeoCoordinates }>> {
    const url = `https://dd.weather.gc.ca/city/gateway/geo/coord/${name}.json`;
    try {
      const response = await ofetch<Record<string, unknown>>(url);
      // parse and return from results - ECCC returns lat/lon in the JSON
      return (response as unknown as Array<{ id: string; name: string; coords: GeoCoordinates }>) ?? [];
    } catch {
      // Fallback: search via common cities endpoint
      const fallbackUrl = `https://dd.weather.gc.ca/city/gateway/geo/coord/en/${name}.json`;
      try {
        const response = await ofetch<Array<Record<string, unknown>>>(fallbackUrl);
        return (response ?? []).map((item: Record<string, unknown>) => ({
          id: String(item['id'] || ''),
          name: String(item['name']) || '',
          coords: {
            latitude: Number(item['lat']),
            longitude: Number(item['lon']),
          } as GeoCoordinates,
        }));
      } catch {
        return [];
      }
    }
  }

  /**
   * Fetch radar products for a given product ID.
   * Available products: M21005 (NEXRAD), M22026 (Canadian radar composite)... etc.
   */
  static async getRadar(
    productId: string,
  ): Promise<ApiResponse<RadarFrame[]>> {
    const url = `https://api.meteo.gc.ca/geo/web?products=${productId}`;
    let response: unknown;
    try {
      response = await ofetch(url);
    } catch {
      // Some product IDs may not exist - fall back gracefully.
      return {
        data: [] as RadarFrame[],
        source: 'CANADIAN_RADAR' as OfficialDataSource,
        timestamp: new Date().toISOString(),
        cached: false,
      };
    }

    const frames = (response as unknown as Array<Record<string, unknown>>) ?? [];
    return {
      data: frames.map(
        (f: Record<string, unknown>) => ({
          timestamp: String(f['timestamp'] || new Date().toISOString()),
          imageUrl: String(f['imageUrl'] || f['image_url'] || ''),
          bounds: {
            west: Number(f['west'] || 0),
            south: Number(f['south'] || 0),
            east: Number(f['east'] || 0),
            north: Number(f['north'] || 0),
          },
          source: 'CANADIAN_RADAR' as OfficialDataSource,
        }) as RadarFrame,
      ),
      source: 'CANADIAN_RADAR' as OfficialDataSource,
      timestamp: new Date().toISOString(),
      cached: false,
    };
  }

  /**
   * Fetch hourly forecast for a grid coordinate.
   */
  static async getForecastHourly(
    lat: number,
    lon: number,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const url = `https://api.meteo.gc.ca/city/geo/point?lat=${lat}&lon=${lon}`;

    let resultArray: Array<Record<string, unknown>> = [];
    try {
      const response = await ofetch<{ geometry: Record<string, unknown>; properties: Array<Record<string, unknown>> }>(url);
      resultArray = (response.properties as Array<Record<string, unknown>>) ?? [];
    } catch {
      return { data: [] as unknown as Record<string, unknown>, source: 'ECCC' as OfficialDataSource, timestamp: new Date().toISOString(), cached: false };
    }
    const hourlyData = resultArray.map((entry: Record<string, unknown>) => ({ tempC: entry['temperature'] || null, windSpeedKmh: entry['wind_speed'] || null, condition: entry['condition'] || '' }));

    return {
      data: hourlyData,
      source: 'ECCC' as OfficialDataSource,
      timestamp: new Date().toISOString(),
      cached: false,
    };
  }
}
