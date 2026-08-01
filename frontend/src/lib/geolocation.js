export function getCurrentPosition(options = { enableHighAccuracy: true, timeout: 10000 }) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location services are not available on this device.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => reject(new Error('Could not access your location. Check your permissions and try again.')),
      options,
    );
  });
}

/**
 * distanceMeters — haversine distance between two { lat, lng } points.
 * Used for the tracking plan's `listing_viewed.distance_m` property:
 * the API doesn't return a precomputed distance, but since the feed
 * already has both the user's coordinates (from getCurrentPosition)
 * and each listing's raw coordinates, this is a real derived value,
 * not an invented one.
 */
export function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
