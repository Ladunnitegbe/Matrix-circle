# FoodShare API Documentation

This document explains the backend API for the FoodShare project in a simple and professional way. It is written especially for beginner frontend developers who want to understand how the app works and what data the API expects.

---

## What this API does

FoodShare helps food vendors share surplus food with nearby individuals and verified charities before it expires. The API handles:

- user registration and login
- profile and location updates
- food listing creation and discovery
- claiming and confirming pickups
- charity verification
- email notifications

---

## Tech stack

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

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a .env file

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

### 3. Start the backend

```bash
npm run dev
```

The server will run at:

```text
http://localhost:5000
```

---

## Base URL

All API routes start with:

```text
/api
```

---

## Authentication overview

The API uses JWT tokens for protected routes.

### Important rule

- Public routes: register and login
- Protected routes: everything else requires a token

### How to send the token

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Common response format

Most successful responses include:

```json
{
  "success": true,
  "msg": "Some message"
}
```

Some endpoints also return extra data such as a token, account info, or user information.

Error responses usually look like this:

```json
{
  "success": false,
  "msg": "Something went wrong"
}
```

Validation errors look like this:

```json
{
  "success": false,
  "msg": "Validation failed",
  "errors": []
}
```

---

## Authentication endpoints

### Register a new account

Endpoint:

```http
POST /api/auth/register
```

This creates a new user account and links it to the correct role profile.

#### Required fields

- email: must be a valid email address
- phoneNumber: must be between 10 and 15 characters
- password: must be at least 8 characters long
- role: one of these values
  - individual
  - charity
  - vendor
- name: at least 2 characters

#### Optional fields

- charityRegNumber: required for charities, minimum 3 characters
- businessName: useful for vendor accounts, minimum 2 characters
- coordinates: optional location as [longitude, latitude]

#### Example request

```json
{
  "email": "user@example.com",
  "phoneNumber": "07012345678",
  "password": "securepassword",
  "role": "individual",
  "name": "Ada",
  "coordinates": [3.3792, 6.5244]
}
```

#### Example success response

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

Endpoint:

```http
POST /api/auth/login
```

This signs in an existing user and returns a JWT token.

#### Required fields

- email: must be a valid email address
- password: must not be empty

#### Example request

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Example success response

```json
{
  "success": true,
  "msg": "Login successful",
  "token": "..."
}
```

---

## User routes

### Get current user profile

```http
GET /api/users/me
```

Requires authentication.

### Update user location

```http
PATCH /api/users/me/location
```

Requires authentication.

#### Request body

```json
{
  "coordinates": [3.3792, 6.5244]
}
```

Note: the coordinates must be sent as [longitude, latitude].

---

## Vendor routes

### Get vendor profile

```http
GET /api/vendors/me
```

Requires vendor authentication.

### Get vendor dashboard

```http
GET /api/vendors/dashboard
```

Requires vendor authentication.

---

## Listing routes

### Create a listing

```http
POST /api/listings
```

Requires vendor authentication.

#### Required fields

- itemDescription: at least 2 characters
- quantity: must be a number greater than or equal to 1
- category: one of
  - cooked_meal
  - baked_goods
  - raw_produce
  - free_donation
- pickupByTime: a valid date/time value
- coordinates: [longitude, latitude]

#### Optional fields

- price: a number or the string "free"
  - if not provided, it defaults to "free"

#### Example request

```json
{
  "itemDescription": "Fresh bread",
  "quantity": 10,
  "price": "free",
  "category": "baked_goods",
  "pickupByTime": "2026-07-27T18:00:00.000Z",
  "coordinates": [3.3792, 6.5244]
}
```

### Get nearby listings

```http
GET /api/listings
```

Requires authentication.

#### Query parameters

- lat: latitude
- lng: longitude
- category: optional filter
- maxDistanceKm: optional, defaults to 5

### Get a single listing

```http
GET /api/listings/:id
```

### Claim a listing

```http
PATCH /api/listings/:id/claim
```

Used by individuals and verified charities.

A claim is temporarily reserved for 15 minutes.

### Confirm pickup

```http
PATCH /api/listings/:id/confirm-pickup
```

Used by vendors to confirm that a claimed listing was picked up.

---

## Admin routes

### Verify a charity account

```http
PATCH /api/admin/charities/:userId/verify
```

Requires admin privileges.

---

## Security and validation

The API includes important protection features:

- JWT authentication
- role-based access control
- input validation with Zod
- request sanitization
- XSS protection
- rate limiting
- helmet security headers

---

## Background processes

The backend also runs background jobs to:

- expire old listings
- release expired claims
- mark no-show pickups

Emails are sent for important events such as:

- charity registration
- charity verification
- nearby listing notifications

---

## Helpful frontend notes

- Register and login are public endpoints.
- All other routes need a valid JWT token.
- Listings are returned based on location.
- Claims expire automatically after 15 minutes.
- Charity accounts must be verified before they can claim listings.

---

## Summary

If you are building the frontend, the most important things to remember are:

1. Register or log in first to get a token.
2. Save the token and attach it to protected requests.
3. Use the correct role for each account.
4. Send location data correctly when working with listings.
5. Handle validation and error messages carefully in the UI.
