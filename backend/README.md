# FoodShare Backend Guide

This is a beginner-friendly guide to the backend API for the FoodShare project.

The backend powers the core features of the app, including user authentication, food listings, claims, pickups, and admin actions.

---

## What you need to run it

Before starting, make sure you have:

- Node.js installed
- npm available
- a MongoDB connection string
- a valid environment configuration

---

## Install dependencies

```bash
npm install
```

---

## Environment variables

Create a .env file with the following values:

```env
PORT=5000
MONGO_URL=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES=7d
BCRYPT_SALT_ROUNDS=10
ALLOWED_ORIGIN=http://localhost:5173
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ADMIN_EMAIL=
ADMIN_PHONE=
ADMIN_PASSWORD=
```

---

## Admin account and admin routes

The backend supports an admin user who can approve charity account verifications.

- `ADMIN_EMAIL`, `ADMIN_PHONE`, and `ADMIN_PASSWORD` are used to seed a default admin account.
- Admin users must authenticate with a valid JWT token.
- The admin-only route is:

```http
PATCH /api/admin/charities/:userId/verify
```

This route verifies a charity account and requires the authenticated user to have the `admin` role.

---

## Start the server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

---

## Main API base URL

```text
/api
```

---

## Authentication

### Register

```http
POST /api/auth/register
```

Required fields:

- email: valid email
- phoneNumber: 10 to 15 characters
- password: at least 8 characters
- role: individual, charity, or vendor
- name: at least 2 characters

Optional fields:

- charityRegNumber: minimum 3 characters
- businessName: minimum 2 characters
- coordinates: [longitude, latitude]

### Login

```http
POST /api/auth/login
```

Required fields:

- email: valid email
- password: cannot be empty

Successful login returns a JWT token that must be used for protected routes.

---

## Protected routes

For protected routes, include this header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Examples of protected routes:

- GET /api/users/me
- PATCH /api/users/me/location
- GET /api/vendors/me
- GET /api/vendors/dashboard
- GET /api/vendors/listings
- POST /api/listings
- GET /api/listings
- PATCH /api/listings/:id/claim

---

## Listing requirements

When creating a listing, the API expects:

- itemDescription: at least 2 characters
- quantity: number greater than or equal to 1
- category: cooked_meal, baked_goods, raw_produce, or free_donation
- pickupByTime: valid date/time value
- coordinates: [longitude, latitude]

Optional:

- price: number or the word "free"

---

## Response style

The API usually returns:

```json
{
  "success": true,
  "msg": "message here"
}
```

Some endpoints return extra data such as token, account, or user details.

Errors are returned with a message and sometimes validation details.

---

## Security features

The backend includes:

- JWT authentication
- role-based access control
- validation with Zod
- input sanitization
- rate limiting
- security headers with Helmet

---

## Notes for frontend developers

- Always log in first to get a token.
- Save the token and include it in future requests.
- Register and login are public routes.
- Most other routes require authentication.
- Charity accounts need to be verified before claiming listings.
- Claims expire automatically after 15 minutes.


GeoJSON is used for location-based searching.

Indexes

- 2dsphere indexes
- Claim expiry indexes
- Listing state indexes

---

# Future Improvements

- Redis Queue (BullMQ)
- Push Notifications
- WebSockets
- File Uploads
- Payment Integration
- Delivery Tracking
