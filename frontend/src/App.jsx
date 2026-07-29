import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage.jsx';
import DiscoverFoodPage from './pages/DiscoverFoodPage/DiscoverFoodPage.jsx';
import CreateListPage from './pages/CreateListPage/CreateListPage.jsx';
import ClaimFoodPage from './pages/ClaimFoodPage/ClaimFoodPage.jsx';
import ReleaseClaimPage from './pages/ReleaseClaimPage/ReleaseClaimPage.jsx';
import RequireAuth from './components/RequireAuth/RequireAuth.jsx';

/**
 * App — full route table for this phase.
 *
 * `/discover`, `/create-listing`, `/claim/:listingId`, and
 * `/claim/:listingId/hold` are all wrapped in `RequireAuth` — every
 * one of them either calls an authenticated endpoint or (for the
 * claim/hold pair) stands in for a flow that will be authenticated
 * once its backend exists. `/create-listing` additionally requires
 * `role="vendor"`, matching `POST /listings`'s own requirement.
 *
 * Note: `src/screens/*` and `src/data/listings.js` are leftover
 * pre-Figma prototype code from before this project's current
 * direction — no longer imported anywhere, intentionally left on disk
 * rather than deleted as part of this feature. A dedicated cleanup
 * pass should remove them.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
