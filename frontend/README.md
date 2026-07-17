# FoodShare — React Component Library

Implements the FoodShare design system in React + vanilla CSS. Every
component (and every screen) owns its own `.css` file — nothing lives in
`index.css` or `App.css` beyond design tokens and a minimal reset.

## What's included

**4 of the 8 MVP flow screens are fully implemented as live, stateful React
screens (50%)** — the Must-Have core loop: post a listing, see it on the
feed, claim it and hold it, and track it on the vendor dashboard.

- Vendor → New listing (US-1)
- Vendor → Dashboard (US-3)
- Resident → Discovery feed + category filter (US-4 / US-5)
- Resident → Claim & hold, with a real ticking countdown (US-6 / US-7)

Each screen exposes its loading / empty / success / error (HTTP-response)
states through the pill switcher above the phone mock, per the design
system's server-response-state requirement.

## Running it yourself

```
npm install
npm run dev       # local dev server
npm run build     # static production build → dist/
```

## Viewing the live demo without installing anything



## Folder structure

```
src/
  tokens.css                # design tokens + reset (the only global CSS)
  App.jsx                   # composition only — no CSS file of its own
  components/
    Button/Button.jsx + .css
    Chip/Chip.jsx + .css
    Card/Card.jsx + .css
    TimeRing/TimeRing.jsx + .css        (signature ring, small)
    CountdownRing/CountdownRing.jsx + .css  (signature ring, live countdown)
    ListingCard/ListingCard.jsx + .css
    FormField/FormField.jsx + .css
    Banner/Banner.jsx + .css
    StatCard/StatCard.jsx + .css
    StatusTag/StatusTag.jsx + .css
    EmptyState/EmptyState.jsx + .css
    FullError/FullError.jsx + .css
    Skeleton/Skeleton.jsx + .css
    VerifiedBadge/VerifiedBadge.jsx + .css
    Icon/Icon.jsx
    Sidebar/, StateSwitcher/, StageHeader/, Stage/, Layout/, PhoneFrame/, StatusBar/
       (demo-shell components, each with its own .css)
  screens/
    VendorListingScreen/
    VendorDashboardScreen/
    DiscoveryFeedScreen/
    ClaimHoldScreen/
  data/listings.js            # sample data used across screens
```
