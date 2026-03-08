/**
 * Haversine Formula: Calculate distance between two GPS coordinates
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimate travel time based on distance
 * Average speed: 20 km/h for city delivery
 * @param distanceKm Distance in kilometers
 * @returns Estimated time in minutes
 */
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeed = 20; // km/h
  const timeInHours = distanceKm / averageSpeed;
  const timeInMinutes = timeInHours * 60;
  return Math.round(timeInMinutes);
}

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km" or "500 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm} km`;
}

/**
 * Format time for display
 * @param minutes Duration in minutes
 * @returns Formatted string (e.g., "45 mins" or "1h 30mins")
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
