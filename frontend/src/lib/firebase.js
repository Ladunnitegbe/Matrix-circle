import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

/**
 * Firebase init — config comes entirely from env vars (VITE_FIREBASE_*),
 * matching the same pattern as VITE_API_BASE_URL. No real project
 * credentials exist in this codebase; without them set, `analytics`
 * stays `null` and `trackEvent` (see analytics.js) becomes a safe
 * no-op rather than throwing.
 *
 * Required env vars (all from your Firebase project settings →
 * "Add app" → Web app):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_MEASUREMENT_ID   — this is the one that ties into
 *                                    Google Analytics (GA4); it's a
 *                                    distinct value from APP_ID, found
 *                                    on the same config screen
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.measurementId);

export const firebaseApp = hasConfig
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null;

/**
 * Analytics needs an async support check (fails in some browsers/
 * environments — e.g. no IndexedDB, some in-app webviews, SSR) and
 * only initializes once that resolves. `analyticsPromise` is what
 * `analytics.js` awaits before ever calling `logEvent`.
 */
export const analyticsPromise = hasConfig
  ? isSupported().then((supported) => (supported ? getAnalytics(firebaseApp) : null))
  : Promise.resolve(null);
