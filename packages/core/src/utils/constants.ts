import type { GeoCoordinates, LayerType, AlertSeverity } from '../types/weather.types.js';

// ---------------------------------------------------------------------------
// DEFAULT_LOCATIONS – major world cities with coordinates (WGS-84)
// ---------------------------------------------------------------------------
export const DEFAULT_LOCATIONS: Record<string, GeoCoordinates> = {
  'New York': { latitude: 40.7128, longitude: -74.006 },
  'Los Angeles': { latitude: 34.0522, longitude: -118.2437 },
  'Chicago': { latitude: 41.8781, longitude: -87.6298 },
  'Houston': { latitude: 29.7604, longitude: -95.3698 },
  'Phoenix': { latitude: 33.4484, longitude: -112.074 },
  'London': { latitude: 51.5074, longitude: -0.1278 },
  'Tokyo': { latitude: 35.6762, longitude: 139.6503 },
  'Paris': { latitude: 48.8566, longitude: 2.3522 },
  'Sydney': { latitude: -33.8688, longitude: 151.2093 },
  'Toronto': { latitude: 43.6532, longitude: -79.3832 },
  'Vancouver': { latitude: 49.2827, longitude: -123.1207 },
  'Montreal': { latitude: 45.5017, longitude: -73.5673 },
  'Moscow': { latitude: 55.7558, longitude: 37.6173 },
  'Delhi': { latitude: 28.7041, longitude: 77.1025 },
  'Cairo': { latitude: 30.0444, longitude: 31.2357 },
  'Beijing': { latitude: 39.9042, longitude: 116.4074 },
};

// ---------------------------------------------------------------------------
// RADAR_REFLECTIVITY_PALETTES – NOAA/NWS Weather Radar colour key
// Values in dBZ (decimal logarithm of mm⁴/m³/s).
// Source: https://www.weather.gov/lot/WeatherRadar.php
// ---------------------------------------------------------------------------
export const RADAR_REFLECTIVITY_PALETTES: Array<{ reflectivity: number; color: string; label: string }> = [
  { reflectivity: -27,    color: '#000000', label: 'Below noise level' },
  { reflectivity: -5,     color: '#0067FF', label: 'Rain/light rain' },
  { reflectivity: 10,     color: '#47D4FF', label: 'Light rain' },
  { reflectivity: 20,     color: '#7ED6F5', label: 'Moderate rain' },
  { reflectivity: 30,     color: '#15CE6F', label: 'Moderate rain' },
  { reflectivity: 40,     color: '#AADD28', label: 'Heavy rain' },
  { reflectivity: 45,     color: '#FFD750', label: 'Heavy rain/hail' },
  { reflectivity: 50,     color: '#E98100', label: 'Heavy rain/hail' },
  { reflectivity: 55,     color: '#E3261D', label: 'Severe thunderstorm' },
];

// ---------------------------------------------------------------------------
// SATELLITE_BANDS – allowed bands for satellite imagery
// ---------------------------------------------------------------------------
export const SATELLITE_BANDS = ['visible', 'infrared', 'waterVapor', 'trueColor', 'nighttime', 'cloudTopTemp'] as const;

// ---------------------------------------------------------------------------
// LAYER_DEFAULTS – default WeatherLayer config per LayerType
// ---------------------------------------------------------------------------
const makeDefaults = (): Record<LayerType, { name: string; description: string; opacity: number; sources: string[]; visible: boolean }> => ({
  radar:              { name: 'Radar Reflectivity',       description: 'NEXRAD & regional radar reflectivity data',                opacity: 0.65, sources: ['NOAA_NEXRAD', 'CANADIAN_RADAR'],     visible: true },
  satellite_vis:      { name: 'Visible Satellite',        description: 'GOES visible spectrum satellite imagery',                      opacity: 1.0,  sources: ['GOES'],                             visible: false },
  satellite_ir:       { name: 'Infrared Satellite',       description: 'GOES infrared satellite imagery (cloud-top temp)',           opacity: 1.0,  sources: ['GOES'],                             visible: false },
  satellite_wv:       { name: 'Water Vapor Satellite',    description: 'GOES water vapor satellite imagery',                         opacity: 1.0,  sources: ['GOES'],                             visible: false },
  satellite_tc:       { name: 'True Color Satellite',     description: 'GOES true-colour composite satellite imagery',               opacity: 1.0,  sources: ['GOES'],                             visible: false },
  temp:               { name: 'Temperature',              description: 'Surface temperature isotherms / map layer',                  opacity: 0.85, sources: ['NWS', 'WPC', 'ECCC'],             visible: false },
  wind_speed:         { name: 'Wind Speed',               description: 'Predicted surface wind speeds',                                opacity: 0.85, sources: ['AWC', 'NWC', 'ECMWF'],            visible: false },
  wind_direction:     { name: 'Wind Direction',           description: 'Predicted surface wind direction vectors',                     opacity: 0.85, sources: ['AWC', 'NWC', 'ECMWF'],            visible: false },
  pressure:           { name: 'Sea-level Pressure',       description: 'Analyzed sea-level pressure contour layer',                    opacity: 0.85, sources: ['NWS', 'WPC', 'ECCC'],             visible: false },
  humidity:           { name: 'Humidity',                 description: 'Relative humidity analysis layer',                             opacity: 0.85, sources: ['AWC', 'NWC'],                     visible: false },
  dewpoint:           { name: 'Dew Point',                description: 'Dew point temperature analysis layer',                         opacity: 0.85, sources: ['NWS', 'ECCC'],                    visible: false },
  air_quality:        { name: 'Air Quality (AQI)',        description: 'Real-time Air Quality Index from monitoring stations',         opacity: 0.75, sources: ['OpenAQ', 'USGS'],                 visible: false },
  uv_index:           { name: 'UV Index',                 description: 'Predicted surface UV index',                                 opacity: 0.85, sources: ['NWS', 'ECCC'],                    visible: false },
  wildfire:           { name: 'Wildfire / Hotspots',      description: 'VIIRS & MODIS active fire hotspots from NASA GIBS',          opacity: 0.75, sources: ['NASA_GIBS', 'NASA_EARTHDATA'],    visible: false },
  snow_depth:         { name: 'Snow Depth',               description: 'Surface analysed snow depth layer',                          opacity: 0.85, sources: ['WPC', 'ECCC'],                    visible: false },
  snowfall:           { name: 'Predicted Snowfall',       description: 'Predicted total snowfall from WPC models',                   opacity: 0.85, sources: ['WPC', 'ECCC'],                    visible: false },
  ice_accumulation:   { name: 'Ice Accumulation',         description: 'Predicted icing / freezing rain accumulation',               opacity: 0.85, sources: ['NWS', 'WPC', 'ECCC'],             visible: false },
  rainfall:           { name: 'Rainfall Intensity',       description: 'Precipitation rate map layer',                               opacity: 0.85, sources: ['NOAA_NEXRAD', 'AWC'],             visible: false },
  lightning:          { name: 'Lightning Strike Activity',description: 'Real-time cloud-to-ground lightning strikes',                  opacity: 0.85, sources: ['NWS', 'SPC'],                     visible: false },
  watches:            { name: 'Watches (Active)',         description: 'Currently-active weather watches (tornado, severe, etc.)',   opacity: 0.35, sources: ['NWS', 'SPC', 'ECCC'],             visible: true },
  warnings:           { name: 'Warnings (Active)',        description: 'Currently-active weather warnings (tornado, flood, etc.)',   opacity: 0.35, sources: ['NWS', 'SPC', 'ECCC'],             visible: true },
  hurricane:          { name: 'Hurricane / Typhoon Track',description: 'Active tropical cyclone tracks and cones of uncertainty',      opacity: 0.85, sources: ['NHC'],                            visible: false },
  tropical_storm:     { name: 'Tropical Storm Track',     description: 'Active tropical storm tracks and cones of uncertainty',      opacity: 0.85, sources: ['NHC', 'ECCC'],                    visible: false },
  tropical_depression:{ name: 'Tropical Depression Track',description: 'Active tropical depression tracks and positions',              opacity: 0.85, sources: ['NHC', 'ECCC'],                    visible: false },
  storm_reports:      { name: 'Storm Reports',            description: 'Observed storm event reports (wind damage, hail, etc.)',     opacity: 0.75, sources: ['SPC', 'NWS'],                     visible: false },
  fronts:             { name: 'Fronts',                   description: 'Cold, warm, stationary & occluded front analysis',            opacity: 1.0,  sources: ['NWS', 'WPC', 'ECCC'],             visible: false },
  surface_analysis:   { name: 'Surface Analysis Map',     description: 'Complete surface weather analysis (isosbaric, fronts)',       opacity: 0.85, sources: ['AWC', 'EUMETSAT'],                visible: false },
});

export const LAYER_DEFAULTS = makeDefaults();

// ---------------------------------------------------------------------------
// AIR_QUALITY_AQI_SCALE – standard AQI breakpoints & labels
// Source: https://www.epa.gov/pm-pollution/particulate-matter-pm-basics
// ---------------------------------------------------------------------------
export const AIR_QUALITY_AQI_SCALE: Array<{ aqiRange: [number, number]; label: string; color: string }> = [
  { aqiRange: [0,    50],   label: 'Good',          color: '#00E400' },
  { aqiRange: [51,   100],  label: 'Moderate',      color: '#FFFF00' },
  { aqiRange: [101,  150],  label: 'Unhealthy (Sensitive)', color: '#FF7E00' },
  { aqiRange: [151,  200],  label: 'Unhealthy',     color: '#FF0000' },
  { aqiRange: [201,  300],  label: 'Very Unhealthy',color: '#99004C' },
  { aqiRange: [301,  500],  label: 'Hazardous',     color: '#7E0023' },
];

// ---------------------------------------------------------------------------
// ALERT_SEVERITY_COLORS – map alert severity levels to colours
// ---------------------------------------------------------------------------
export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  extreme:   '#D50032', // red
  severe:    '#FF6D00', // orange
  moderate:  '#FFD600', // yellow
  minor:     '#00B0FF', // blue
  unknown:   '#9E9E9E', // grey
};

// ---------------------------------------------------------------------------
// PRIORITY_ALPHABETICAL_ORDER – alert type priority ordering (descending)
// Tornado and hurricane-related alerts are prioritised first.
// ---------------------------------------------------------------------------
export const PRIORITY_ALPHABETICAL_ORDER: AlertType[] = [
  'tornado',
  'hurricane',
  'typhoon',
  'tropical_storm',
  'tropical_depression',
  'flash_flood',
  'flood',
  'thunderstorm_winds',
  'ice_storm',
  'snow_squall',
  'blizzard',
  'winter_storm',
  'heat',
  'cold',
  'freeze',
  'wind',
  'downburst',
  'lightning',
  'thunderstorm',
  'smoke',
  'air_quality',
  'fog',
  'safety',
];
