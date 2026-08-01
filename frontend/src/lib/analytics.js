import { logEvent } from 'firebase/analytics';
import { analyticsPromise } from './firebase.js';

/**
 * trackEvent — the one function every screen calls to fire an
 * analytics event. Deliberately never throws: if Firebase isn't
 * configured (no env vars set) or Analytics isn't supported in this
 * browser, it just logs to the console in dev and does nothing in
 * production, rather than breaking the page a real user is trying to
 * use over a missing/misconfigured analytics key.
 *
 * Event names and property shapes here come directly from the
 * FoodShare Event Tracking Plan — nothing invented beyond what's
 * specified there.
 */
export async function trackEvent(eventName, properties = {}) {
  const analytics = await analyticsPromise;

  if (!analytics) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics:noop]', eventName, properties);
    }
    return;
  }

  logEvent(analytics, eventName, properties);
}
