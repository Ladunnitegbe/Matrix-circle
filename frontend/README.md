# FoodShare — Frontend

React + Vite + Tailwind CSS. Connects to the documented FoodShare API
(base URL configurable via `VITE_API_BASE_URL`, defaults to
`http://localhost:5000/api`).

## Running it

```
npm install
npm run dev        # local dev server
npm run build       # production build → dist/
```

To point at a real backend, create a `.env` file:

```
VITE_API_BASE_URL=https://your-api-host/api
```

## Route table

| Route | Page | Auth required |
|---|---|---|
| `/` | Landing Page | No |
| `/login` | Login | No |
| `/register` | Registration (Individual / Charity / Vendor, one shared form) | No |
| `/discover` | Discover Food feed | Yes |
| `/create-listing` | Create Listing | Yes — `role: vendor` only |
| `/claim/:listingId` | Claim Food detail | Yes |
| `/claim/:listingId/hold` | Release Claim (hold countdown) | Yes |

Any unmatched route redirects to `/`.

## Folder structure

```
src/
  App.jsx                   # route table
  tokens.css                # Tailwind directives + a small set of
                             # legacy CSS custom properties, kept only
                             # for the handful of components below
                             # that still depend on them
  api/
    auth.js                 # login, register
    listings.js              # getListings, getListing, createListing
  lib/
    apiClient.js             # fetch wrapper matching the documented
                             # { success, ... } / { success:false, msg,
                             # errors } response shape
    authStorage.js           # token/account persistence (localStorage)
    protectedRequest.js      # wraps apiClient with auto-attached token
                             # + centralized redirect-to-login on 401
    geolocation.js           # shared browser Geolocation wrapper
  components/                # ~45 reusable components — see below
  pages/
    LandingPage/
    LoginPage/
    RegistrationPage/
    DiscoverFoodPage/
    CreateListPage/
    ClaimFoodPage/
    ReleaseClaimPage/
```

## Components

Two generations exist side by side right now:

- **Current (Tailwind-based)** — everything under `src/components/`
  except the six listed below. No `.css` files; all styling comes from
  `tailwind.config.js`. This is the actively-developed system.
- **Legacy (pre-Figma, CSS-variable-based)** — `Banner`, `CountdownRing`,
  `FormField`, `ListingCard`, `Skeleton`, `StatCard`, `StatusTag`,
  `TimeRing`, `VerifiedBadge`. Still functional and still referenced
  (`CountdownRing` is reused as-is on `ReleaseClaimPage`), but not part
  of the current design-token system. Worth a dedicated migration pass.

## Known gaps — flagged deliberately, not hidden

1. **Discover Food's cards don't show a vendor name or address.** The
   `GET /listings` response only includes `vendorId` (no business name)
   and raw coordinates (no resolved address). There's no documented
   endpoint to resolve either, so nothing was invented to fill the gap.
2. **Claiming a listing is not connected to any backend.** `POST
   /listings/:id/claim` is explicitly listed as "Not Yet Available" in
   the API docs. `ClaimFoodPage`'s button and the entire
   `ReleaseClaimPage` screen are local-only state — no server-side
   persistence, no real hold, no real expiry. Both files have inline
   comments marking exactly what needs to change once that endpoint
   ships.
3. **`src/screens/*` and `src/data/listings.js` are orphaned.** Leftover
   pre-Figma prototype code, no longer imported by anything. Left on
   disk rather than deleted mid-feature; safe to remove in a cleanup pass.
4. **Only `login`/`register` exist in `src/api/auth.js`.** No
   password-reset, email-verification, or logout-endpoint calls exist
   in the docs, so none were built — logout is just a local
   `clearSession()`.
