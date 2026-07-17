# API Contract

This document reflects the routes currently wired in the backend entrypoint and the handlers, validation, and error behavior implemented in the auth, user, and vendor modules.

## Auth

### POST /api/auth/register

- Authentication required: No
- Roles permitted: None (public route)
- Request body:
  - `email`: `string` (required) — must be a valid email address
  - `phoneNumber`: `string` (required) — minimum length 10, maximum length 15
  - `password`: `string` (required) — minimum length 8
  - `role`: `"individual" | "charity" | "vendor"` (required)
  - `name`: `string` (required) — minimum length 2
  - `charityRegNumber`: `string` (optional) — minimum length 3
  - `businessName`: `string` (optional) — minimum length 2
  - `coordinates`: `[number, number]` (optional) — tuple of two numbers
- Success response: `201 Created`
  - `success`: `boolean`
  - `msg`: `"Account created successfully"`
  - `token`: `string`
  - `account`: object with:
    - `id`: `string`
    - `email`: `string`
    - `role`: `string`
- Errors:
  - `400 BadRequestError` — `Email already registered`
  - `400 BadRequestError` — `Phone number already registered`
  - `400 BadRequestError` — `businessName and coordinates are required for vendor registration`
  - `400 ValidationError` — validation failed for the request body

### POST /api/auth/login

- Authentication required: No
- Roles permitted: None (public route)
- Request body:
  - `email`: `string` (required) — must be a valid email address
  - `password`: `string` (required) — minimum length 1
- Success response: `200 OK`
  - `success`: `boolean`
  - `msg`: `"Login successful"`
  - `token`: `string`
  - `account`: object with:
    - `id`: `string`
    - `email`: `string`
    - `role`: `string`
- Errors:
  - `401 UnauthorizedError` — `Invalid credentials`
  - `400 ValidationError` — validation failed for the request body

## User

### GET /api/users/me

- Authentication required: Yes — Bearer token via `authenticateUser`
- Roles permitted: Any authenticated user (no additional role restriction)
- Request body: None
- Success response: `200 OK`
  - `success`: `boolean`
  - `user`: object representing the user profile returned by the service, containing:
    - `accountId`: `string`
    - `accountType`: `"individual" | "charity"`
    - `name`: `string`
    - `charityRegNumber`: `string` (optional)
    - `charityVerifiedAt`: `Date | null` (optional)
    - `location`: object with `type: "Point"` and `coordinates: [number, number]` (optional)
    - `createdAt`: `Date`
- Errors:
  - `401 UnauthorizedError` — `Authentication token is required.`
  - `404 NotFoundError` — `User profile not found`

## Vendor

### GET /api/vendors/me

- Authentication required: Yes — Bearer token via `authenticateUser`
- Roles permitted: `vendor` only via `authorizePermissions("vendor")`
- Request body: None
- Success response: `200 OK`
  - `success`: `boolean`
  - `vendor`: object representing the vendor profile returned by the service, containing:
    - `accountId`: `string`
    - `businessName`: `string`
    - `location`: object with `type: "Point"` and `coordinates: [number, number]`
    - `createdAt`: `Date`
- Errors:
  - `401 UnauthorizedError` — `Authentication token is required.`
  - `401 UnauthorizedError` — `Authentication required.`
  - `403 ForbiddenError` — `You do not have permission to perform this action.`
  - `404 NotFoundError` — `Vendor profile not found`
