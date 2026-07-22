/**
 * Format a temperature value from Celsius to the requested unit.
 */
export function formatTemperature(degC: number, unit: 'C' | 'F'): string {
  const val = unit === 'F' ? degC * 1.8 + 32 : degC;
  return `${roundTo(val, 1)}°${unit}`;
}

/**
 * Format wind speed from km/h to the requested unit.
 */
export function formatWindSpeed(kmh: number, unit: 'kmh' | 'mph' | 'ms' | 'knots'): string {
  let value = kmh;
  if (unit === 'mph') value *= 0.621371;
  else if (unit === 'ms') value /= 3.6;
  else if (unit === 'knots') value /= 1.852;
  return `${roundTo(value, 1)} ${unit}`;
}

/**
 * Convert a wind direction in degrees to a compass direction string.
 */
export function formatWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(normalizeAngle(deg) / 22.5) % 16;
  return directions[index];
}

/**
 * Format atmospheric pressure in hPa (hectopascals).
 */
export function formatPressure(hpa: number): string {
  return `${roundTo(hpa, 1)} hPa`;
}

/**
 * Format an ISO timestamp to a human-readable string.
 */
export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

/**
 * Format AQI value with quality label.
 */
export function formatAQI(aqi: number): { value: string; label: string } {
  const goodLabel = aqi <= 50 ? 'Good' :
    aqi <= 100 ? 'Moderate' :
      aqi <= 150 ? 'Unhealthy (Sensitive Groups)' :
        aqi <= 200 ? 'Unhealthy' :
          aqi <= 300 ? 'Very Unhealthy' :
            'Hazardous';
  return { value: `${aqi}`, label: goodLabel };
}

/**
 * Format precipitation amount from mm to the requested unit.
 */
export function formatPrecipitation(mm: number, unit: 'mm' | 'in'): string {
  const val = unit === 'in' ? mm * 0.0393701 : mm;
  return `${roundTo(val, 2)} ${unit}`;
}

/**
 * Round a number to the specified decimal places.
 */
export function roundTo(num: number, decimals: number): number {
  if (!Number.isFinite(num)) return num;
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
