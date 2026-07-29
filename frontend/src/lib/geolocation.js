/**
 * getCurrentPosition — promise-based wrapper around the browser's
 * Geolocation API. Shared by `LocationField` (vendor registration and
 * Create List's auto-filled location) and the Discover Food feed
 * (which needs the user's coordinates to call `GET /listings`), so
 * the same availability/permission error handling lives in one place
 * instead of being duplicated per screen.
 */
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
