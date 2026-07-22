export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface LocationSearch {
  query: string;
  type: 'city' | 'zip' | 'airport' | 'coordinates' | 'landmark';
  coords?: GeoCoordinates;
}

export interface WeatherObservation {
  location: GeoCoordinates;
  observedAt: string; // ISO date
  temperature?: number;
  feelsLike?: number;
  humidity?: number; // percentage
  dewPoint?: number;
  windSpeed?: number; // km/h
  windGust?: number;
  windDirection?: number; // degrees
  pressure?: number; // hPa
  visibility?: number; // km
  ceiling?: number; // m
  uvIndex?: number;
  airQualityIndex?: number;
  condition: string; // clear, partly cloudy, rain, etc.
  precipitation?: {
    rate?: number;
    amount?: number;
    type?: 'rain' | 'snow' | 'ice' | 'mixed';
  };
  sunrise?: string;
  sunset?: string;
  moonPhase?: number;
  source: OfficialDataSource;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  condition: string;
  uvIndex?: number;
}

export interface DailyForecast {
  date: string;
  highTemp: number;
  lowTemp: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  condition: string;
  sunrise: string;
  sunset: string;
}

export interface ForecastData {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  location: GeoCoordinates;
  source: OfficialDataSource;
  lastUpdated: string;
}

export type RadarReflectivityColor = {
  reflectivity: number;
  color: string;
  label: string;
};

export interface RadarFrame {
  timestamp: string;
  imageUrl: string;
  bounds: { west: number; south: number; east: number; north: number };
  source: OfficialDataSource;
}

export interface RadarData {
  frames: RadarFrame[];
  currentFrame: RadarFrame;
  reflectivityPalette: RadarReflectivityColor[];
}

export type SatelliteBand =
  | 'visible'
  | 'infrared'
  | 'waterVapor'
  | 'trueColor'
  | 'nighttime'
  | 'cloudTopTemp';

export interface SatelliteTile {
  imageUrl: string;
  timestamp: string;
  band: SatelliteBand;
  bounds: { west: number; south: number; east: number; north: number };
  source: OfficialDataSource;
}

export interface SatelliteData {
  tiles: Map<SatelliteBand, SatelliteTile>;
  bounds: { west: number; south: number; east: number; north: number };
  timeSpan: { start: string; end: string };
  lastUpdated: string;
}

export interface WindFieldData {
  vectors: Array<{
    x: number;
    y: number;
    windX: number;
    windY: number;
  }>;
  timestamp: string;
  source: OfficialDataSource;
}

export type AlertSeverity = 'extreme' | 'severe' | 'moderate' | 'minor' | 'unknown';

export type AlertType =
  | 'tornado'
  | 'thunderstorm_winds'
  | 'flash_flood'
  | 'flood'
  | 'hurricane'
  | 'typhoon'
  | 'tropical_storm'
  | 'tropical_depression'
  | 'blizzard'
  | 'winter_storm'
  | 'ice_storm'
  | 'heat'
  | 'cold'
  | 'wind'
  | 'fog'
  | 'smoke'
  | 'air_quality'
  | 'lightning'
  | 'thunderstorm'
  | 'freeze'
  | 'snow_squall'
  | 'downburst'
  | 'safety';

export interface Alert {
  id: string;
  event: string;
  severity: AlertSeverity;
  type: AlertType;
  description: string;
  instructions: string;
  areaDescription: string;
  polygon?: number[][]; // [[lat, lon], ...] coordinates
  effective: string;
  onset: string;
  expires: string;
  source: OfficialDataSource;
}

export interface StormTrackPoint {
  timestamp: string;
  lat: number;
  lon: number;
  speed: number;
  direction: number;
  intensity?: number;
  reflectivity?: number;
  lightningCount?: number;
}

export interface StormInfo {
  stormId: string;
  name?: string;
  type: 'thunderstorm' | 'tornado' | 'hurricane' | 'tropical_storm';
  track: StormTrackPoint[];
  currentStrength: string;
  estimatedArrival?: string;
  estimatedRainfall?: number;
}

export interface AirQualityData {
  aqi: number;
  primaryPollutant: string;
  pm25?: number;
  pm10?: number;
  ozone?: number;
  no2?: number;
  so2?: number;
  co?: number;
  timestamp: string;
  source: OfficialDataSource;
}

export interface SnowData {
  depth?: number;
  recentSnowfall?: number;
  snowfallForecast: Array<{ date: string; amount: number }>;
  timestamp: string;
}

export interface LightningStrike {
  lat: number;
  lon: number;
  energy: number;
  timestamp: string;
  type: 'cloud-to-ground' | 'intra-cloud';
}

export interface LightningCluster {
  lat: number;
  lon: number;
  count: number;
  maxEnergy: number;
  radius: number;
  timestamp: string;
}

export interface PressureNode {
  lat: number;
  lon: number;
  pressure: number;
  tendency?: 'rising' | 'falling' | 'steady';
}

export interface IsothermData {
  temperatures: Array<{ lat: number; lon: number; temp: number }>;
  timestamp: string;
  source: OfficialDataSource;
}

export interface SurfaceAnalysis {
  highs: PressureNode[];
  lows: PressureNode[];
  fronts: FrontSegment[];
  isotherms?: IsothermData;
  timestamp: string;
  source: OfficialDataSource;
}

export interface FrontSegment {
  type: 'cold' | 'warm' | 'occluded' | 'stationary' | 'weak';
  points: Array<{ lat: number; lon: number }>;
}

export interface HurricaneWatch {
  name: string;
  centerLat: number;
  centerLon: number;
  maxWind: number;
  category?: number;
  movementDirection: number;
  movementSpeed: number;
  polygons: Array<{ lat: number; lon: number }[]>;
  source: OfficialDataSource;
}

export type OfficialDataSource =
  | 'NWS'
  | 'NOAA_NEXRAD'
  | 'SPC'
  | 'WPC'
  | 'NHC'
  | 'AWC'
  | 'NWC'
  | 'ECCC'
  | 'CANADIAN_RADAR'
  | 'GOES'
  | 'EUMETSAT'
  | 'NASA_GIBS'
  | 'NASA_EARTHDATA'
  | 'OpenAQ'
  | 'USGS'
  | 'CAP_ALERT';

export interface ApiResponse<T> {
  data: T;
  source: OfficialDataSource;
  cached: boolean;
  timestamp: string;
  error?: string;
}

export type LayerType =
  | 'radar'
  | 'satellite_vis'
  | 'satellite_ir'
  | 'satellite_wv'
  | 'satellite_tc'
  | 'temp'
  | 'wind_speed'
  | 'wind_direction'
  | 'pressure'
  | 'humidity'
  | 'dewpoint'
  | 'air_quality'
  | 'uv_index'
  | 'wildfire'
  | 'snow_depth'
  | 'snowfall'
  | 'ice_accumulation'
  | 'rainfall'
  | 'lightning'
  | 'watches'
  | 'warnings'
  | 'hurricane'
  | 'tropical_storm'
  | 'tropical_depression'
  | 'storm_reports'
  | 'fronts'
  | 'surface_analysis';

export interface WeatherLayer {
  id: LayerType;
  name: string;
  description: string;
  opacity: number;
  visible: boolean;
  source: OfficialDataSource[];
  legend?: Array<{ value: number; label: string; color: string }>;
}
