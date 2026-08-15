# FoodShare API Documentation

This document explains the backend API for the FoodShare project in a simple and professional way. It is written especially for beginner frontend developers who want to understand how the app works and what data the API expects.

---

## Table of Contents

1. [What this API does](#what-this-api-does)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Base URL](#base-url)
5. [Authentication](#authentication)
6. [Rate Limiting](#rate-limiting)
7. [Security Features](#security-features)
8. [API Response Format](#api-response-format)
9. [Error Handling](#error-handling)
10. [Authentication Endpoints](#authentication-endpoints)
11. [User Endpoints](#user-endpoints)
12. [Vendor Endpoints](#vendor-endpoints)
13. [Listing Endpoints](#listing-endpoints)
14. [Claim Endpoints](#claim-endpoints)
15. [Admin Endpoints](#admin-endpoints)

---

## What this API does

FoodShare helps food vendors share surplus food with nearby individuals and verified charities before it expires. The API handles:

- User registration and authentication with JWT tokens
- User profile management and location updates
- Food listing creation, discovery, and management
- Claiming and confirming food pickups
- Charity account verification and management
- Email notifications for claim events
- Automatic job scheduling for listing expiration
- Admin dashboard for charity verification

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
- Express Rate Limit
- Input Sanitization

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

## Authentication

### Overview

The API uses JWT (JSON Web Tokens) for authentication on protected routes.

### Authentication Rules

- **Public routes**: `/api/auth/register` and `/api/auth/login`
- **Protected routes**: All other routes require a valid JWT token

### How to send the token

Include the token in the Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### User Roles

The system supports four roles:

- **individual**: Regular users who can claim food
- **charity**: Verified charitable organizations that can claim food
- **vendor**: Businesses that can list food for sharing
- **admin**: Administrators who can verify charity accounts

### Token details

- Tokens are returned on successful registration and login
- Token expiration is set to `7d` (7 days) by default
- Tokens are signed using `ACCESS_TOKEN_SECRET` from environment variables
- Always include the token in subsequent requests to protected endpoints

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

### General Rate Limiter

- **Window**: 15 minutes
- **Max requests**: 100 per window
- **Applied to**: All routes by default

### Authentication Rate Limiter

- **Window**: 15 minutes
- **Max requests**: 10 per window
- **Applied to**: `/api/auth/register`, `/api/auth/login`

### Claim Rate Limiter

- **Window**: 1 minute
- **Max requests**: 5 per window
- **Applied to**: `/api/listings/:id/claim`

### Rate limit response

When the rate limit is exceeded, the API responds with:

```json
{
  "success": false,
  "msg": "Too many requests, please try again later."
}
```

HTTP Status: `429 Too Many Requests`

---

## Security Features

The API includes multiple security layers:

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Different users can access different endpoints
- **Input Validation**: Zod validation schemas on all request bodies
- **Input Sanitization**: Automatic sanitization of all inputs to prevent injection attacks
- **Security Headers**: Helmet middleware for setting security headers
- **CORS Protection**: Only allowed origins can access the API
- **Rate Limiting**: Prevents brute force and abuse attacks
- **Password Hashing**: Bcrypt with configurable salt rounds (default: 10)

---

## API Response Format

### Success Response

Most successful responses follow this format:

```json
{
  "success": true,
  "msg": "Some message"
}
```

Some endpoints also return extra data such as a token, account info, or user information.

### Error Response

Error responses follow this format:

```json
{
  "success": false,
  "msg": "Something went wrong"
}
```

### Validation Error Response

Validation errors include detailed error information:

```json
{
  "success": false,
  "msg": "Validation failed",
  "errors": []
}
```

---

## Error Handling

The API provides clear error messages for different scenarios:

| Error Type | Status Code | Message | Description |
|---|---|---|---|
| Validation Error | 400 | Validation failed | Request data doesn't match schema |
| Unauthorized | 401 | Authentication token is required | Missing or invalid token |
| Forbidden | 403 | You do not have permission to perform this action | User role doesn't have access |
| Not Found | 404 | Route not found / Resource not found | Resource or endpoint doesn't exist |
| Bad Request | 400 | Invalid request data | Malformed request |
| Too Many Requests | 429 | Too many requests, please try again later | Rate limit exceeded |
| Server Error | 500 | Something went wrong, please try again later | Internal server error |

---

## Authentication Endpoints

### Register a new account

Endpoint:

```http
POST /api/auth/register
```

**Description**: Creates a new user account and links it to the correct role profile (individual, charity, or vendor).

**Authentication**: Not required (public endpoint)

**Rate Limit**: 10 requests per 15 minutes

#### Required fields

| Field | Type | Constraints | Description |
|---|---|---|---|
| email | string | Valid email format | User's email address |
| phoneNumber | string | 10-15 characters | User's phone number |
| password | string | Minimum 8 characters | Account password (hashed with Bcrypt) |
| role | string | One of: individual, charity, vendor | User account role |
| name | string | Minimum 2 characters | User's full name |

#### Optional fields

| Field | Type | Constraints | Description |
|---|---|---|---|
| charityRegNumber | string | Minimum 3 characters | Required for charity role |
| businessName | string | Minimum 2 characters | Vendor business name (required for vendor) |
| address | string | Minimum 5 characters | Vendor business address (required for vendor) |
| coordinates | array | [longitude, latitude] | Initial location coordinates (required for vendor) |

**Note**: For vendor role, `businessName`, `address`, and `coordinates` are all required fields.

#### Example request (Individual)

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

#### Example request (Vendor)

```json
{
  "email": "vendor@example.com",
  "phoneNumber": "07012345678",
  "password": "securepassword",
  "role": "vendor",
  "name": "John Doe",
  "businessName": "Fresh Foods Co",
  "address": "123 Market Street, Lagos, Nigeria",
  "coordinates": [3.3792, 6.5244]
}
```

#### Example success response

```json
{
  "success": true,
  "msg": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "account": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phoneNumber": "07012345678",
    "role": "individual",
    "createdAt": "2026-08-15T10:30:00.000Z"
  }
}
```

#### Error responses

```json
{
  "success": false,
  "msg": "Validation failed",
  "errors": ["email must be a valid email", "password must be at least 8 characters"]
}
```

---

### Login

Endpoint:

```http
POST /api/auth/login
```

**Description**: Authenticates a user and returns a JWT token for use in protected endpoints.

**Authentication**: Not required (public endpoint)

**Rate Limit**: 10 requests per 15 minutes

#### Required fields

| Field | Type | Constraints | Description |
|---|---|---|---|
| email | string | Valid email format | User's email address |
| password | string | Not empty | User's password |

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "account": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "individual"
  }
}
```

#### Error responses

```json
{
  "success": false,
  "msg": "Invalid credentials"
}
```

---

## User Endpoints

### Get current user profile

Endpoint:

```http
GET /api/users/me
```

**Description**: Retrieves the profile of the authenticated user (individual or charity).

**Authentication**: Required

**Roles allowed**: individual, charity

#### Example success response

```json
{
  "success": true,
  "user": {
    "_id": "607f1f77bcf86cd799439012",
    "accountId": "507f1f77bcf86cd799439011",
    "accountType": "individual",
    "name": "Ada",
    "location": {
      "type": "Point",
      "coordinates": [3.3792, 6.5244]
    },
    "createdAt": "2026-08-15T10:30:00.000Z"
  }
}
```

---

### Update user location

Endpoint:

```http
PATCH /api/users/me/location
```

**Description**: Updates the location/coordinates of the authenticated user.

**Authentication**: Required

**Roles allowed**: individual, charity

#### Request body

```json
{
  "coordinates": [3.3792, 6.5244]
}
```

**Note**: Coordinates must be sent as `[longitude, latitude]`. This is used for location-based listing discovery.

#### Example success response

```json
{
  "success": true,
  "user": {
    "_id": "607f1f77bcf86cd799439012",
    "accountId": "507f1f77bcf86cd799439011",
    "accountType": "individual",
    "name": "Ada",
    "location": {
      "type": "Point",
      "coordinates": [3.3792, 6.5244]
    }
  }
}
```

---

## Vendor Endpoints

### Get vendor profile

Endpoint:

```http
GET /api/vendors/me
```

**Description**: Retrieves the profile of the authenticated vendor.

**Authentication**: Required

**Roles allowed**: vendor

#### Example success response

```json
{
  "success": true,
  "vendor": {
    "_id": "607f1f77bcf86cd799439013",
    "accountId": "507f1f77bcf86cd799439011",
    "businessName": "Fresh Foods Co",
    "location": {
      "type": "Point",
      "coordinates": [3.3792, 6.5244]
    },
    "createdAt": "2026-08-15T10:30:00.000Z"
  }
}
```

---

### Get vendor dashboard

Endpoint:

```http
GET /api/vendors/dashboard
```

**Description**: Retrieves vendor dashboard statistics including total listings, active listings, claimed items, and pickup history.

**Authentication**: Required

**Roles allowed**: vendor

#### Example success response

```json
{
  "success": true,
  "totalListings": 10,
  "activeListings": 5,
  "claimedItems": 12,
  "pickedUpItems": 8,
  "expiredListings": 2
}
```

---

### Get vendor listings

Endpoint:

```http
GET /api/vendors/listings
```

**Description**: Retrieves all listings created by the authenticated vendor, sorted from newest to oldest. Each listing includes claim information.

**Authentication**: Required

**Roles allowed**: vendor

#### Example success response

```json
{
  "success": true,
  "listings": [
    {
      "_id": "607f1f77bcf86cd799439014",
      "vendorId": "607f1f77bcf86cd799439013",
      "itemDescription": "Fresh bread",
      "quantity": 10,
      "remainingQuantity": 8,
      "price": "free",
      "category": "baked_goods",
      "pickupByTime": "2026-07-27T18:00:00.000Z",
      "location": {
        "type": "Point",
        "coordinates": [3.3792, 6.5244]
      },
      "state": "claimed",
      "claims": [
        {
          "claimedBy": "607f1f77bcf86cd799439012",
          "claimantType": "individual",
          "claimedAt": "2026-07-27T10:00:00.000Z",
          "holdExpiresAt": "2026-07-27T10:15:00.000Z",
          "status": "pending"
        }
      ],
      "createdAt": "2026-07-27T09:00:00.000Z"
    }
  ]
}
```

---

## Listing Endpoints

### Create a listing

Endpoint:

```http
POST /api/listings
```

**Description**: Creates a new food listing. Only vendors can create listings.

**Authentication**: Required

**Roles allowed**: vendor

#### Required fields

| Field | Type | Constraints | Description |
|---|---|---|---|
| itemDescription | string | Minimum 2 characters | Description of the food item |
| quantity | number | Minimum 1 | Total quantity available |
| category | string | One of: cooked_meal, baked_goods, raw_produce, free_donation | Food category |
| pickupByTime | date | Valid ISO date/time | Deadline for pickup |
| coordinates | array | [longitude, latitude] | Location of food pickup |

#### Optional fields

| Field | Type | Default | Description |
|---|---|---|---|
| price | number or "free" | "free" | Price per item (number) or free |

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

#### Example success response

```json
{
  "success": true,
  "listing": {
    "_id": "607f1f77bcf86cd799439014",
    "vendorId": "607f1f77bcf86cd799439013",
    "itemDescription": "Fresh bread",
    "quantity": 10,
    "remainingQuantity": 10,
    "price": "free",
    "category": "baked_goods",
    "pickupByTime": "2026-07-27T18:00:00.000Z",
    "location": {
      "type": "Point",
      "coordinates": [3.3792, 6.5244]
    },
    "state": "active",
    "claims": [],
    "createdAt": "2026-07-27T09:00:00.000Z"
  }
}
```

---

### Get nearby listings (Feed)

Endpoint:

```http
GET /api/listings
```

**Description**: Retrieves food listings near the user's location, sorted by distance. Supports filtering by category.

**Authentication**: Required

**Roles allowed**: individual, charity, vendor

#### Query parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| lat | number | Yes | - | Latitude of search location |
| lng | number | Yes | - | Longitude of search location |
| category | string | No | - | Filter by category (cooked_meal, baked_goods, raw_produce, free_donation) |
| maxDistanceKm | number | No | 5 | Maximum distance in kilometers |

#### Example request

```http
GET /api/listings?lat=6.5244&lng=3.3792&category=baked_goods&maxDistanceKm=10
```

#### Example success response

```json
{
  "success": true,
  "count": 5,
  "listings": [
    {
      "_id": "607f1f77bcf86cd799439014",
      "vendorId": "607f1f77bcf86cd799439013",
      "itemDescription": "Fresh bread",
      "quantity": 10,
      "remainingQuantity": 8,
      "price": "free",
      "category": "baked_goods",
      "pickupByTime": "2026-07-27T18:00:00.000Z",
      "location": {
        "type": "Point",
        "coordinates": [3.3792, 6.5244]
      },
      "state": "claimed",
      "createdAt": "2026-07-27T09:00:00.000Z"
    }
  ]
}
```

---

### Get a single listing

Endpoint:

```http
GET /api/listings/:id
```

**Description**: Retrieves detailed information about a specific listing.

**Authentication**: Required

**Roles allowed**: individual, charity, vendor

#### URL parameters

| Parameter | Type | Description |
|---|---|---|
| id | string | Listing MongoDB ObjectId |

#### Example request

```http
GET /api/listings/607f1f77bcf86cd799439014
```

#### Example success response

```json
{
  "success": true,
  "listing": {
    "_id": "607f1f77bcf86cd799439014",
    "vendorId": "607f1f77bcf86cd799439013",
    "itemDescription": "Fresh bread",
    "quantity": 10,
    "remainingQuantity": 8,
    "price": "free",
    "category": "baked_goods",
    "pickupByTime": "2026-07-27T18:00:00.000Z",
    "location": {
      "type": "Point",
      "coordinates": [3.3792, 6.5244]
    },
    "state": "claimed",
    "claims": [
      {
        "claimedBy": "607f1f77bcf86cd799439012",
        "claimantType": "individual",
        "claimedAt": "2026-07-27T10:00:00.000Z",
        "holdExpiresAt": "2026-07-27T10:15:00.000Z",
        "status": "pending"
      }
    ],
    "createdAt": "2026-07-27T09:00:00.000Z"
  }
}
```

---

## Claim Endpoints

### Claim a listing

Endpoint:

```http
PATCH /api/listings/:id/claim
```

**Description**: Allows an individual or verified charity to claim a food listing. The claim is held for 15 minutes, during which the vendor must confirm the pickup.

**Authentication**: Required

**Roles allowed**: individual, charity

**Rate Limit**: 5 requests per minute

#### URL parameters

| Parameter | Type | Description |
|---|---|---|
| id | string | Listing MongoDB ObjectId |

#### Example request

```http
PATCH /api/listings/607f1f77bcf86cd799439014/claim
```

**Note**: This endpoint uses the authenticated user's ID from the JWT token. No request body is required.

#### Claim Hold Behavior

- Claims are held for 15 minutes
- If the vendor doesn't confirm the pickup within 15 minutes, the claim automatically expires
- Only one claim can be active per user per listing
- Multiple users can claim the same listing, and each will have a separate hold period

#### Example success response

```json
{
  "success": true,
  "msg": "Portion claimed successfully",
  "listing": {
    "_id": "607f1f77bcf86cd799439014",
    "vendorId": "607f1f77bcf86cd799439013",
    "itemDescription": "Fresh bread",
    "quantity": 10,
    "remainingQuantity": 8,
    "price": "free",
    "category": "baked_goods",
    "pickupByTime": "2026-07-27T18:00:00.000Z",
    "location": {
      "type": "Point",
      "coordinates": [3.3792, 6.5244]
    },
    "state": "claimed",
    "claims": [
      {
        "claimedBy": "607f1f77bcf86cd799439012",
        "claimantType": "individual",
        "claimedAt": "2026-07-27T10:00:00.000Z",
        "holdExpiresAt": "2026-07-27T10:15:00.000Z",
        "status": "pending"
      }
    ]
  }
}
```

#### Error responses

```json
{
  "success": false,
  "msg": "Listing not found"
}
```

```json
{
  "success": false,
  "msg": "Charity must be verified before claiming"
}
```

---

### Confirm pickup

Endpoint:

```http
PATCH /api/listings/:id/confirm-pickup
```

**Description**: Allows a vendor to confirm that a claimed food listing has been picked up by the claimant.

**Authentication**: Required

**Roles allowed**: vendor

#### URL parameters

| Parameter | Type | Description |
|---|---|---|
| id | string | Listing MongoDB ObjectId |

#### Request body

```json
{
  "claimantUserId": "607f1f77bcf86cd799439012"
}
```

| Field | Type | Description |
|---|---|---|
| claimantUserId | string | MongoDB ObjectId of the user who claimed the listing |

#### Example request

```http
PATCH /api/listings/607f1f77bcf86cd799439014/confirm-pickup
Content-Type: application/json

{
  "claimantUserId": "607f1f77bcf86cd799439012"
}
```

#### Example success response

```json
{
  "success": true,
  "msg": "Pickup confirmed",
  "listing": {
    "_id": "607f1f77bcf86cd799439014",
    "vendorId": "607f1f77bcf86cd799439013",
    "itemDescription": "Fresh bread",
    "quantity": 10,
    "remainingQuantity": 9,
    "price": "free",
    "category": "baked_goods",
    "pickupByTime": "2026-07-27T18:00:00.000Z",
    "location": {
      "type": "Point",
      "coordinates": [3.3792, 6.5244]
    },
    "state": "picked_up",
    "claims": [
      {
        "claimedBy": "607f1f77bcf86cd799439012",
        "claimantType": "individual",
        "claimedAt": "2026-07-27T10:00:00.000Z",
        "holdExpiresAt": "2026-07-27T10:15:00.000Z",
        "status": "picked_up"
      }
    ]
  }
}
```

#### Error responses

```json
{
  "success": false,
  "msg": "Listing not found"
}
```

```json
{
  "success": false,
  "msg": "No pending claim from this user"
}
```

---

## Admin Endpoints

### Get pending charities

Endpoint:

```http
GET /api/admin/charities/pending
```

**Description**: Retrieves a list of all charity accounts awaiting verification by an admin.

**Authentication**: Required

**Roles allowed**: admin

#### Example success response

```json
{
  "success": true,
  "charities": [
    {
      "_id": "607f1f77bcf86cd799439012",
      "accountId": "507f1f77bcf86cd799439011",
      "accountType": "charity",
      "name": "Food for All Charity",
      "charityRegNumber": "CH123456",
      "charityVerifiedAt": null,
      "location": {
        "type": "Point",
        "coordinates": [3.3792, 6.5244]
      },
      "createdAt": "2026-08-15T10:30:00.000Z"
    }
  ]
}
```

---

### Verify a charity account

Endpoint:

```http
PATCH /api/admin/charities/:userId/verify
```

**Description**: Approves and verifies a charity account, allowing it to claim food listings.

**Authentication**: Required

**Roles allowed**: admin

#### URL parameters

| Parameter | Type | Description |
|---|---|---|
| userId | string | User MongoDB ObjectId |

#### Example request

```http
PATCH /api/admin/charities/607f1f77bcf86cd799439012/verify
```

**Note**: This endpoint requires no request body.

#### Example success response

```json
{
  "success": true,
  "msg": "Charity verified",
  "user": {
    "_id": "607f1f77bcf86cd799439012",
    "accountId": "507f1f77bcf86cd799439011",
    "accountType": "charity",
    "name": "Food for All Charity",
    "charityRegNumber": "CH123456",
    "charityVerifiedAt": "2026-08-15T14:30:00.000Z",
    "location": {
      "type": "Point",
      "coordinates": [3.3792, 6.5244]
    },
    "createdAt": "2026-08-15T10:30:00.000Z"
  }
}
```

#### Error responses

```json
{
  "success": false,
  "msg": "Charity not found"
}
```

---

## Listing States

A listing goes through various states throughout its lifecycle:

| State | Description |
|---|---|
| active | Listing is available and can be claimed |
| claimed | Listing has one or more pending claims |
| picked_up | All quantities have been picked up |
| expired_unclaimed | Pickup deadline has passed with no claims |
| expired_no_show | Pickup deadline has passed and claimant didn't show up |

---

## Claim Status

Claims within a listing can have the following statuses:

| Status | Description |
|---|---|
| pending | Claim is active and waiting for vendor confirmation (15-minute hold) |
| picked_up | Vendor has confirmed the pickup |
| lapsed | Claim hold expired before vendor confirmation |

---

## Automatic Background Jobs

The API runs background jobs to manage listing expiration:

### Expire Listings Job

- **Frequency**: Runs periodically (configured via Node Cron)
- **Purpose**: Automatically marks listings as expired when their `pickupByTime` has passed
- **Action**: Updates listing state to `expired_unclaimed` or `expired_no_show` based on claims

---

## Best Practices for Frontend Developers

1. **Always store the token**: Save the JWT token from login/register responses and include it in all subsequent requests
2. **Handle token expiration**: Check for 401 Unauthorized responses and prompt users to log in again
3. **Use coordinates correctly**: Always send coordinates as [longitude, latitude], not [latitude, longitude]
4. **Respect rate limits**: Implement exponential backoff when receiving 429 responses
5. **Validate on both sides**: The backend validates all inputs, but frontend validation provides better UX
6. **Check user role**: Verify the user's role before showing certain UI elements
7. **Handle claim holds**: Remind users that claims are only held for 15 minutes
8. **Verify charities before showing**: Don't show charity-specific features until `charityVerifiedAt` is not null
9. **Use geographic queries**: Leverage the location-based listing feed for better user experience
10. **Subscribe to updates**: For real-time updates, consider implementing WebSocket connections or polling

---

## Common API Workflows

### User Registration and Login Flow

1. User fills registration form with email, phone, password, role, and name
2. Frontend validates the form
3. POST to `/api/auth/register` with form data
4. Save returned token to local storage
5. Redirect to appropriate dashboard based on role

### Food Discovery and Claiming Flow

1. Get user's location (via geolocation or manual entry)
2. GET `/api/listings?lat=X&lng=Y` to fetch nearby listings
3. User selects a listing and views details with GET `/api/listings/:id`
4. User clicks "Claim" button to PATCH `/api/listings/:id/claim`
5. Show 15-minute countdown timer
6. When vendor confirms pickup, listing state changes to `picked_up`

### Vendor Listing Creation Flow

1. Vendor navigates to create listing form
2. Fills in item description, quantity, category, pickup time, and location
3. POST to `/api/listings` with form data
4. Listing appears on their dashboard
5. When users claim, vendor sees pending claims
6. Vendor PATCH `/api/listings/:id/confirm-pickup` to confirm pickups

### Admin Verification Flow

1. Admin views pending charities with GET `/api/admin/charities/pending`
2. Reviews charity registration numbers and details
3. Clicks verify button to PATCH `/api/admin/charities/:userId/verify`
4. Charity account is now verified and can claim listings

This endpoint is used by admin users to approve verification for charity accounts.

Requirements:

- Authentication with a valid JWT token
- The authenticated user must have the `admin` role
- `userId` must be the ID of a charity account pending verification

#### Example success response

```json
{
  "success": true,
  "msg": "Charity verified",
  "user": {
    "_id": "...",
    "email": "charity@example.com",
    "role": "charity",
    "isVerified": true,
    "name": "Charity Name"
  }
}
```

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
