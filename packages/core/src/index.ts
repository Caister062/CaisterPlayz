export type {
  GeoCoordinates,
  LocationSearch,
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  ForecastData,
  RadarReflectivityColor,
  RadarFrame,
  RadarData,
  SatelliteBand,
  SatelliteTile,
  SatelliteData,
  WindFieldData,
  AlertSeverity,
  AlertType,
  Alert,
  StormTrackPoint,
  StormInfo,
  AirQualityData,
  SnowData,
  LightningStrike,
  LightningCluster,
  PressureNode,
  IsothermData,
  SurfaceAnalysis,
  FrontSegment,
  HurricaneWatch,
  OfficialDataSource,
  ApiResponse,
  LayerType,
  WeatherLayer,
} from './types/weather.types.js';

export {
  DEFAULT_LOCATIONS,
  RADAR_REFLECTIVITY_PALETTES,
  SATELLITE_BANDS,
  LAYER_DEFAULTS,
  AIR_QUALITY_AQI_SCALE,
  ALERT_SEVERITY_COLORS,
  PRIORITY_ALPHABETICAL_ORDER,
} from './utils/constants.js';

export {
  formatTemperature,
  formatWindSpeed,
  formatWindDirection,
  formatPressure,
  formatTimestamp,
  formatAQI,
  formatPrecipitation,
  roundTo,
} from './utils/formatters.js';

export {
  haversineDistance,
  bearing,
  destinationPoint,
  pointInPolygon,
  normalizeAngle,
  clamp,
} from './utils/geo.js';

export { NWSService } from './weather-sources/nws.js';
export { GOESService } from './weather-sources/goes.js';
export { ECCCService } from './weather-sources/ec.gc.ca.js';
export * from './weather-sources/index.js';

export { TileCache, APICache } from './caching/index.js';
