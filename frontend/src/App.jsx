import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LandingPage from './pages/LandingPage/LandingPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.jsx';
import DiscoverFoodPage from './pages/DiscoverFoodPage/DiscoverFoodPage.jsx';
import CreateListPage from './pages/CreateListPage/CreateListPage.jsx';
import ClaimFoodPage from './pages/ClaimFoodPage/ClaimFoodPage.jsx';
import ReleaseClaimPage from './pages/ReleaseClaimPage/ReleaseClaimPage.jsx';
import DashboardPage from './pages/DashboardPage/DashboardPage.jsx';
import RequireAuth from './components/RequireAuth/RequireAuth.jsx';

/**
 * App — complete application route table.
 *
 * Public routes:
 * - /
 * - /login
 * - /register
 *
 * Protected routes:
 * - /discover
 * - /create-listing (vendor only)
 * - /claim/:listingId
 * - /claim/:listingId/hold
 *
 * The listing and claim flows were added during the latest UI pass,
 * while the original Landing, Login, and Registration pages remain
 * available. Future screens (such as Vendor Dashboard and Confirm
 * Pickup) can be added without affecting the existing routes.
 *
 * Note: Legacy prototype files under `src/screens/*` and
 * `src/data/listings.js` are intentionally left untouched and can be
 * removed during a dedicated cleanup pass.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Protected Routes */}
        <Route
          path="/vendor/dashboard"

          element={
            <RequireAuth role="vendor">
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/discover"
          element={
            <RequireAuth>
              <DiscoverFoodPage />
            </RequireAuth>
          }
        />

        <Route
          path="/create-listing"
          element={
            <RequireAuth role="vendor">
              <CreateListPage />
            </RequireAuth>
          }
        />

        <Route
          path="/claim/:listingId"
          element={
            <RequireAuth>
              <ClaimFoodPage />
            </RequireAuth>
          }
        />

        <Route
          path="/claim/:listingId/hold"
          element={
            <RequireAuth>
              <ReleaseClaimPage />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}