# Backend API for Matrix Circle (FoodShare)

This backend provides the REST API for the **FoodShare** application developed by **Matrix Circle** during the Orange Internship Programme at Circo Digital Academy.

FoodShare helps restaurants, caterers, bakeries, and other food vendors redistribute surplus food to nearby individuals and verified charities before it goes to waste.

---

# Tech Stack

* Node.js
* TypeScript
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Zod Validation
* Nodemailer
* Node Cron
* Helmet
* Morgan
* CORS
* Express Rate Limiter
* mongo-sanitize
* XSS Sanitization

---

# Features

* JWT Authentication
* Vendor Registration
* Individual Registration
* Charity Registration
* MongoDB Transactions for Registration
* Vendor Food Listings
* Nearby Listings Feed
* Claim & Reserve Listings
* Pickup Confirmation
* Vendor Dashboard
* Charity Verification
* Location Updates
* Email Notifications
* Automatic Listing Expiry

---

# Getting Started

## Install dependencies

```bash
npm install
```

---

## Create a .env file

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

## Start the server

```bash
npm run dev
```

Server:

```text
http://localhost:5000
```

---

# Base URL

```
/api
```

---

# Authentication

Protected routes require

```http
Authorization: Bearer <JWT_TOKEN>
```

JWT is returned after successful login or registration.

---

# API Endpoints

## Authentication

### Register

```
POST /api/auth/register
```

Creates an account together with its User or Vendor profile using a MongoDB transaction.

Returns

```json
{
  "success": true,
  "msg": "Account created successfully",
  "token": "...",
  "account": {}
}
```

---

### Login

```
POST /api/auth/login
```

Returns a JWT token.

---

# Users

## Get Profile

```
GET /api/users/me
```

Authentication required.

---

## Update Location

```
PATCH /api/users/me/location
```

Authentication required.

Request

```json
{
  "coordinates":[3.3792,6.5244]
}
```

---

# Vendors

## Vendor Profile

```
GET /api/vendors/me
```

Vendor only.

---

## Vendor Dashboard

```
GET /api/vendors/dashboard
```

Vendor only.

Returns

```json
{
  "success": true,
  "claimed":12,
  "discarded":4
}
```

---

# Listings

## Create Listing

```
POST /api/listings
```

Vendor only.

---

## Feed

```
GET /api/listings
```

Authentication required.

Query Parameters

| Parameter     | Description            |
| ------------- | ---------------------- |
| lat           | Latitude               |
| lng           | Longitude              |
| category      | Optional               |
| maxDistanceKm | Optional (default 5km) |

---

## Get Listing

```
GET /api/listings/:id
```

---

## Claim Listing

```
PATCH /api/listings/:id/claim
```

Individuals and verified charities only.

A listing is reserved for **15 minutes**.

---

## Confirm Pickup

```
PATCH /api/listings/:id/confirm-pickup
```

Vendor only.

Marks a claimed listing as picked up.

---

# Admin

## Verify Charity

```
PATCH /api/admin/charities/:userId/verify
```

Admin only.

Marks a charity as verified and sends a confirmation email.

---

# Email Notifications

The backend automatically sends emails when:

* Charity registration is received.
* Charity verification is approved.
* A nearby food listing becomes available.

---

# Automatic Listing Expiry

A scheduled cron job runs every minute to:

* Expire listings whose pickup time has passed.
* Release reservations that exceed the 15-minute hold period.
* Mark expired claimed listings as no-show.

---

# Registration Flow

Registration is transactional.

The following operations succeed or fail together:

* Create Account
* Create User Profile or Vendor Profile

This prevents partial registrations.

---

# Validation

Incoming requests are validated using **Zod**.

Invalid requests return HTTP 400 with validation details.

---

# Security

The backend includes:

* JWT Authentication
* Role-based Authorization
* Helmet
* Rate Limiting
* XSS Sanitization
* MongoDB Injection Protection
* Centralized Error Handling

---

# Response Format

Successful responses

```json
{
  "success": true,
  "msg":"...",
  "data":{}
}
```

Errors

```json
{
  "success": false,
  "msg":"..."
}
```

Validation Errors

```json
{
  "success": false,
  "msg":"Validation failed",
  "errors":[]
}
```

---

# Frontend Notes

* Authentication endpoints are public.
* All other endpoints require JWT authentication.
* Listings are returned by proximity.
* Claims automatically expire after 15 minutes.
* Vendor dashboard updates automatically from listing states.
* Charity accounts must be verified before they can claim listings.

---

# Future Improvements

These features are intentionally outside the MVP scope:

* Push Notifications
* Payment Processing
* Delivery Logistics
* Background Job Queue (BullMQ/RabbitMQ)
* Redis Caching
* WebSockets
* Object Storage for Images
