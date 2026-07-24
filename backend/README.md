# FoodShare Backend API (Matrix Circle)

Backend API powering the **FoodShare** application developed during the Orange Internship Program.

FoodShare connects food vendors with nearby individuals and verified charities by allowing vendors to publish surplus food listings that can be claimed before they expire.

---

# Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Zod Validation
- Nodemailer
- Node Cron
- Helmet
- CORS
- Morgan
- express-rate-limit
- mongo-sanitize
- xss

---

# Features

- JWT Authentication
- Vendor Registration
- Individual Registration
- Charity Registration
- Vendor Dashboard
- Charity Verification
- Geo-location Listings
- Nearby Listing Discovery
- Listing Claim & Reservation
- Pickup Confirmation
- Automatic Listing Expiry
- Email Notifications
- Input Validation
- Rate Limiting
- MongoDB Transactions

---

# Getting Started

## Install dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file.

```env
PORT=5000

MONGO_URL=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES=7d

BCRYPT_SALT_ROUNDS=10

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

ADMIN_EMAIL=
ADMIN_PHONE=
ADMIN_PASSWORD=

ALLOWED_ORIGIN=http://localhost:5173
```

---

## Start Development Server

```bash
npm run dev
```

Server runs on

```
http://localhost:5000
```

---

# Authentication

Protected endpoints require

```
Authorization: Bearer <JWT_TOKEN>
```

---

# API Routes

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Register account |
| POST | /api/auth/login | Login |

---

## Users

| Method | Endpoint |
|---------|----------|
| GET | /api/users/me |
| PATCH | /api/users/me/location |

---

## Vendors

| Method | Endpoint |
|---------|----------|
| GET | /api/vendors/me |
| GET | /api/vendors/dashboard |

---

## Listings

| Method | Endpoint |
|---------|----------|
| POST | /api/listings |
| GET | /api/listings |
| GET | /api/listings/:id |

---

## Claims

| Method | Endpoint |
|---------|----------|
| PATCH | /api/listings/:id/claim |
| PATCH | /api/listings/:id/confirm-pickup |

---

## Admin

| Method | Endpoint |
|---------|----------|
| PATCH | /api/admin/charities/:userId/verify |

---

# Response Format

There is no wrapping `data` object — response fields sit directly alongside `success`, and the field names vary per endpoint.

**Successful response (example — register/login):**
```json
{
  "success": true,
  "msg": "Account created successfully",
  "token": "...",
  "account": { "id": "...", "email": "...", "role": "..." }
}
```

**Successful response (example — profile fetch):**
```json
{
  "success": true,
  "user": { "...": "profile fields" }
}
```

**Generic error (auth, permission, not found):**
```json
{
  "success": false,
  "msg": "Invalid credentials"
}
```

**Validation error:**
```json
{
  "success": false,
  "msg": "Validation failed",
  "errors": [
    { "field": "body.email", "message": "Invalid email" }
  ]
}
```

---

# Security

The API includes

- JWT Authentication
- Role-based Authorization
- MongoDB Transactions
- Request Validation
- Input Sanitization
- XSS Protection
- Mongo Sanitization
- Rate Limiting
- Helmet Security Headers

---

# Background Jobs

Node Cron runs every minute to

- Expire old listings
- Release expired claims
- Mark no-show pickups

---

# Notification System

Emails are sent for

- Charity Registration
- Charity Verification
- Nearby Listings

---

# Database

MongoDB + Mongoose

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