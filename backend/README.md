# Backend API for Matrix Circle

This backend provides the API used by the frontend for authentication, user/vendor profiles, and food listings.

## Tech stack

- Node.js + TypeScript
- Express
- MongoDB + Mongoose
- JWT for authentication
- Zod for validation
- CORS, rate limiting, sanitization, and error handling middleware

## Getting started

### 1. Install dependencies

From the backend folder:

```bash
npm install
```

### 2. Create environment variables

Create a `.env` file in the backend folder with:

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/matrix-circle
```

### 3. Run the server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

## Base URL

All routes are prefixed with `/api`.

## Authentication

Most protected routes require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

The token is returned from the auth endpoints after successful login or registration.

## Current API endpoints

### Auth

- `POST /api/auth/register` — create an account and receive a JWT
- `POST /api/auth/login` — sign in and receive a JWT

### User

- `GET /api/users/me` — fetch the authenticated user's profile

### Vendor

- `GET /api/vendors/me` — fetch the authenticated vendor profile

### Listings

- `POST /api/listings` — create a listing (vendor only)
- `GET /api/listings` — fetch listings feed
- `GET /api/listings/:id` — fetch one listing by ID

## Response format

Most successful responses follow this pattern:

```json
{
  "success": true,
  "msg": "...",
  "data": {}
}
```

Authentication responses typically include a `token` field.

## Notes for frontend developers

- Public routes are auth endpoints only.
- Protected routes require a valid JWT.
- Vendor-only actions are restricted by role.
- Validation errors and authentication errors are returned with appropriate HTTP status codes.
- The backend is currently using MongoDB with Mongoose models for accounts, users, vendors, and listings.
