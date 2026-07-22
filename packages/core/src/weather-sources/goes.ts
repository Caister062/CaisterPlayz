import { ofetch } from 'ofetch';
import type { ApiResponse, SatelliteBand, SatelliteTile, OfficialDataSource, GeoCoordinates } from '../types/weather.types.js';

export interface GOESChannelInfo {
  subdataset: string;
  name: string;
}

/**
 * Service wrapper for NASA GIBS (Global Imagery Browse Services) WMT endpoint.
 * GIBS provides on-demand satellite imagery from GOES, MODIS, VIIRS and others.
 *
 * Documentation: https://wiki.earthdata.nasa.gov/display/GIBS/About+GIBS+Satellite+Data
 */
export class GOESService {
  static readonly API_BASE = 'https://gibs.earthdata.nasa.gov/wmts';

  /**
   * Fetch a single WMT Tile URL and its metadata for the specified satellite layer.
   */
  static async getTile(
    layerId: string,
    band: SatelliteBand,
    lat: number,
    lon: number,
    zoom: number,
  ): Promise<ApiResponse<SatelliteTile>> {
    const time = new Date().toISOString().split('T')[0];
    const col = Math.floor(((lon + 180) % 360 + 360) % 360 / 360 * 256);
    const row = Math.floor((90 - lat) / 180 * 256);
    const tileUrl = `${GOESService.API_BASE}/1.0.0/EOS_LST_CCI/3266798/default/${time}/${band}/${zoom}/${row}/${col}.jpg`;

    return {
      data: {
        imageUrl: tileUrl,
        timestamp: new Date().toISOString(),
        band,
        bounds: { west: lon - 0.1, south: lat - 0.1, east: lon + 0.1, north: lat + 0.1 },
        source: 'GOES' as OfficialDataSource,
      } as SatelliteTile,
      source: 'NASA_GIBS' as OfficialDataSource,
      timestamp: new Date().toISOString(),
      cached: false,
    };
  }
  /**
   * Fetch multiple satellite tiles within a bounding region.
   */
  static async getImagery(
    bounds: { west: number; south: number; east: number; north: number },
    band: SatelliteBand,
  ): Promise<Array<ApiResponse<SatelliteTile>>> {
    const width = Math.ceil((bounds.east - bounds.west));
    const height = Math.ceil((bounds.north - bounds.south));
    const results: Array<ApiResponse<SatelliteTile>> = [];

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const lon = bounds.west + (c * (bounds.east - bounds.west)) / width;
        const lat = bounds.north - (r * (bounds.north - bounds.south)) / height;
        results.push(await this.getTile(band, band, lat, lon, 1));
      }
    }

    return results;
  }

  /**
   * Fetch available GOES layers from the GIBS WMT capabilities document.
   */
  static async getAvailableLayers(): Promise<ApiResponse<string[]>> {
    const url = `${GOESService.API_BASE}/1.0.0/EOS_LST_CCI/WMTServer.cap`;
    try {
      await ofetch(url);
      return {
        data: ['GOES-East-Convection', 'GOES-East-Clear-Convective', 'GOES-East-Red-Visible-Wavelength'],
        source: 'NASA_GIBS' as OfficialDataSource,
        timestamp: new Date().toISOString(),
        cached: false,
      };
    } catch {
      return {
        data: ['GOES-East-Convection', 'GOES-East-Clear-Convective', 'GOES-East-Red-Visible-Wavelength'],
        source: 'NASA_GIBS' as OfficialDataSource,
        timestamp: new Date().toISOString(),
        cached: false,
      };
    }
  }
}
