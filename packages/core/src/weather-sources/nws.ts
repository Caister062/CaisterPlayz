import { ofetch } from 'ofetch';
import type { ApiResponse, GeoCoordinates, Alert, OfficialDataSource } from '../types/weather.types.js';

export interface NWSPointMetaProperties {
  fireWeather?: Record<string, unknown>;
  relativeLocation?: {
    geometry: Record<string, unknown>;
  };
  forecastOffice: string;
  forecastGridData: string;
  warningCounty: string;
  warningFireWireZone: string;
  forecastZone: string;
  county: string;
  fireWeatherZone: string;
  temperature: string;
  dewpoint: string;
  windSpeed: string;
  windDirection: string;
  maxTemperature: string;
  minTemperature: string;
  metarObservations?: string;
}

export interface NWSPointMeta {
  type: string;
  geometry: Record<string, unknown>;
  properties: NWSPointMetaProperties;
}

export interface NWSGridpointData {
  geometry: Record<string, unknown>;
  properties: Record<
    string,
    | number[]
    | { values: Array<{ validISOString: string; value: number }> }
    | undefined
  >;
}

export interface NWSForecasTData extends ApiResponse<unknown> {
  geometry: Record<string, unknown>;
  properties: {
    periods: ReadonlyArray<{
      id: string;
      name: string | null;
      startTime: string;
      endTime: string;
      isDaytime: boolean;
      temperature: number;
      temperatureUnit: string;
      temperatureTrend: string | null;
      probabilityOfPrecipitation: { value?: number; unitCode: string };
      dewpoint: { value: number; unitCode: string };
      relativeHumidity: { value?: number; unitCode: string };
      windSpeed: string;
      windDirection: string;
      shortForecast: string;
      longForecast: string;
    }>;
  };
}

export interface NWSSearchResult {
  id: string;
  url: string;
  address: string;
  name: string;
  type: string;
}

/**
 * Service wrapper for the NOAA National Weather Service API.
 *
 * Documentation: https://www.weather.gov/documentation/services-web-api
 *
 * Publicly available – no authentication required.
 */
export class NWSService {
  static readonly API_BASE = 'https://api.weather.gov';

  /**
   * Query the NWS /points/{latitude},{longitude} endpoint to retrieve metadata
   * for the nearest grid cell, including forecast and alert URLs.
   */
  static async pointQuery(
    latitude: number,
    longitude: number,
  ): Promise<ApiResponse<NWSPointMeta>> {
    const url = `${NWSService.API_BASE}/points/${latitude},${longitude}`;
    const response = await ofetch(url, {
      headers: { 'Accept': 'application/geo+json' },
    });
    return {
      data: response as unknown as NWSPointMeta,
      source: 'NWS',
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch the NWS gridpoint forecast (WMO GRIB2-derived) for a specific
   * X/Y grid cell. Requires gridX and gridY from `pointQuery`.
   */
  static async getGridpoint(
    gridpoint: string, // format "offices/X,Y" e.g. "LOT/34,15"
  ): Promise<ApiResponse<NWSGridpointData>> {
    const url = `${NWSService.API_BASE}/gridpoints/${gridpoint}`;
    const response = await ofetch(url, {
      headers: { 'Accept': 'application/geo+json' },
    });
    return {
      data: response as unknown as NWSGridpointData,
      source: 'NWS',
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch the forecast periods array at /forecast.
   */
  static async getForecast(
    gridX: number,
    gridY: number,
  ): Promise<ApiResponse<NWSForecasTData>> {
    // The actual forecast URL comes from pointQuery properties.forecastGridData,
    // but we provide a convenience wrapper here using the gridpoint endpoint.
    // For hourly data NWS provides at /gridpoints/{office}/{x},{y} (see getGridpoint).
    const url = `${NWSService.API_BASE}/forecast`;
    const response = await ofetch(url, {
      headers: { 'Accept': 'application/geo+json' },
    });
    return {
      data: {
        geometry: response.geometry ?? {},
        properties: (response as NWSForecasTData).properties ?? { periods: [] },
      },
      source: 'NWS' as OfficialDataSource,
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch active alerts for a given area (county FIPS code or NWS zone).
   */
  static async getLocationAlerts(
    area: string,
  ): Promise<ApiResponse<Alert[]>> {
    const url = `${NWSService.API_BASE}/alerts?area=${area}`;
    const response = await ofetch(url);
    // The NWS API wraps features in a FeatureCollection
    const features = (response as unknown as { features?: any[] })?.features ?? [];
    return {
      data: features as unknown as Alert[],
      source: 'NWS',
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Convenience method to resolve the point (lat/lon) alert URL
   * and return active alerts.
   */
  static async getPointAlerts(
    latitude: number,
    longitude: number,
  ): Promise<ApiResponse<Alert[]>> {
    const url = `${NWSService.API_BASE}/alerts?point=${latitude},${longitude}`;
    const response = await ofetch(url);
    const features = (response as unknown as { features?: any[] })?.features ?? [];
    return {
      data: features as unknown as Alert[],
      source: 'NWS',
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Search for a city/zip by name using the NWS /cities/search endpoint.
   */
  static async searchCity(name: string): Promise<GeoCoordinates | null> {
    const url = `${NWSService.API_BASE}/cities/search?query=${encodeURIComponent(name)}`;
    const response = await ofetch<{ features?: Array<{ geometry: { coordinates: [number, number] }; properties: { name: string } }> }>(url);
    const feature = response.features?.[0];
    if (!feature) return null;
    // NWS GeoJSON feature.geometry.coordinates returns [longitude, latitude]
    const [longitude, latitude] = feature.geometry.coordinates as [number, number];
    return { latitude, longitude };
  }

  /**
   * Fetch current METAR observations for an airport (e.g. "KORD").
   */
  static async getMETAR(stationId: string): Promise<ApiResponse<Record<string, unknown>>> {
    const url = `${NWSService.API_BASE}/stations/${stationId}/observations/latest`;
    const response = await ofetch<{ geometry: Record<string, unknown>; properties: Record<string, unknown> }>(url);
    return {
      data: response.properties,
      source: 'NWS',
      cached: false,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fetch the NWS fire weather observations for a gridpoint.
   */
  static async getFireWeather(gridpoint: string): Promise<ApiResponse<Record<string, unknown>>> {
    const url = `${NWSService.API_BASE}/gridpoints/${gridpoint}/firewx/observations/latest`;
    try {
      const response = await ofetch(url);
      return {
        data: response as unknown as Record<string, unknown>,
        source: 'NWS',
        cached: false,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Fire weather endpoint may not exist for all gridpoints
      return {
        data: {} as Record<string, unknown>,
        source: 'NWS',
        cached: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
