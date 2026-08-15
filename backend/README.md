# FoodShare Backend Guide

A comprehensive TypeScript/Express.js backend API for the FoodShare food-sharing platform. This guide covers setup, architecture, development workflow, and key features.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Running the Server](#running-the-server)
5. [Project Structure](#project-structure)
6. [Architecture](#architecture)
7. [Database](#database)
8. [Authentication & Security](#authentication--security)
9. [API Overview](#api-overview)
10. [Middleware](#middleware)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)
13. [Email Notifications](#email-notifications)
14. [Background Jobs](#background-jobs)
15. [Development Workflow](#development-workflow)
16. [Troubleshooting](#troubleshooting)
17. [API Reference](#api-reference)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **MongoDB** (local or Atlas)
- **Text Editor** (VS Code recommended)
- **Git** (for version control)

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd food-share-api/backend
```

### 2. Install dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- express
- mongoose
- typescript
- zod
- bcryptjs
- jsonwebtoken
- nodemailer
- express-rate-limit
- helmet
- cors
- morgan
- dotenv

---

## Environment Setup

### Create .env file

Create a `.env` file in the backend root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/foodshare

# JWT Configuration
ACCESS_TOKEN_SECRET=your-super-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRES=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# CORS & Origins
ALLOWED_ORIGIN=http://localhost:5173

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@foodshare.com

# Admin Account Seeding
ADMIN_EMAIL=admin@foodshare.com
ADMIN_PHONE=+1234567890
ADMIN_PASSWORD=secure-admin-password
```

### Environment Variables Explained

| Variable | Purpose | Example |
|---|---|---|
| PORT | Server port | 5000 |
| MONGO_URL | MongoDB connection | mongodb://localhost:27017/foodshare |
| ACCESS_TOKEN_SECRET | JWT signing key | your-secret-key |
| ACCESS_TOKEN_EXPIRES | Token expiration | 7d |
| BCRYPT_SALT_ROUNDS | Password hashing rounds | 10 |
| ALLOWED_ORIGIN | CORS allowed origin | http://localhost:5173 |
| SMTP_HOST | Email server host | smtp.gmail.com |
| SMTP_PORT | Email server port | 587 |
| SMTP_USER | Email account | your-email@gmail.com |
| SMTP_PASS | Email password/app-password | your-app-password |
| SMTP_FROM | Sender email | noreply@foodshare.com |
| ADMIN_EMAIL | Admin account email | admin@foodshare.com |
| ADMIN_PHONE | Admin phone number | +1234567890 |
| ADMIN_PASSWORD | Admin password | secure-password |

---

## Running the Server

### Development Mode

```bash
npm run dev
```

Starts the server with hot-reload using ts-node-dev. The server will run at:

```text
http://localhost:5000
```

### Build for Production

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` folder.

### Start Production Server

```bash
npm run start
```

Runs the compiled JavaScript from the `dist/` folder.

### Seed Admin Account

```bash
npm run seed:admin
```

Creates a default admin account using the credentials from `.env`. Useful for first-time setup.

---

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server initialization and startup
│   │
│   ├── modules/               # Feature-based modules
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.model.ts
│   │   │   └── auth.validation.ts
│   │   │
│   │   ├── user/              # User profile module
│   │   │   ├── user.route.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.model.ts
│   │   │   └── user.validation.ts
│   │   │
│   │   ├── vendor/            # Vendor operations module
│   │   │   ├── vendor.route.ts
│   │   │   ├── vendor.controller.ts
│   │   │   ├── vendor.service.ts
│   │   │   └── vendor.model.ts
│   │   │
│   │   ├── listing/           # Food listings module
│   │   │   ├── listing.route.ts
│   │   │   ├── listing.controller.ts
│   │   │   ├── listing.service.ts
│   │   │   ├── listing.model.ts
│   │   │   └── listing.validation.ts
│   │   │
│   │   ├── claim/             # Claiming food module
│   │   │   ├── claim.route.ts
│   │   │   ├── claim.controller.ts
│   │   │   ├── claim.service.ts
│   │   │   └── claim.validation.ts
│   │   │
│   │   ├── admin/             # Admin operations module
│   │   │   ├── admin.route.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── admin.service.ts
│   │   │
│   │   ├── notification/      # Email notifications
│   │   │   ├── notification.service.ts
│   │   │   └── email-templates.ts
│   │   │
│   │   └── jobs/              # Background jobs
│   │       └── expireListings.job.ts
│   │
│   ├── common/                # Shared utilities and middleware
│   │   ├── error/             # Custom error classes
│   │   │   ├── custom-error.ts
│   │   │   ├── bad-request.ts
│   │   │   ├── unauthorized-error.ts
│   │   │   ├── forbidden-error.ts
│   │   │   ├── not-found-error.ts
│   │   │   └── validation-error.ts
│   │   │
│   │   ├── middleware/        # Express middleware
│   │   │   ├── isAuth.ts                    # JWT authentication
│   │   │   ├── validation-request.ts       # Request validation
│   │   │   ├── error-handler.ts            # Error handling
│   │   │   ├── async-wrapper.ts            # Async function wrapper
│   │   │   ├── sanitize.ts                 # Input sanitization
│   │   │   └── rateLimiter.middleware.ts   # Rate limiting
│   │   │
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   │       └── jwt.ts         # JWT helper functions
│   │
│   ├── config/                # Configuration files
│   │   └── db.ts              # MongoDB connection
│   │
│   └── scripts/               # Utility scripts
│       └── seedAdmin.ts       # Admin seed script
│
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

---

## Architecture

### Design Pattern: Module-Based Architecture

Each module follows a consistent structure:

```
module/
├── module.route.ts      # Express routes
├── module.controller.ts # Request handlers
├── module.service.ts    # Business logic
├── module.model.ts      # MongoDB schema
└── module.validation.ts # Request validation schemas
```

### Data Flow

```
Request → Route → Controller → Service → Model → Database
   ↓        ↓        ↓          ↓        ↓         ↓
Router   Middleware Validation Logic  Schema  MongoDB
                                      Query
```

### Request Lifecycle

1. **Route Definition**: Request matched to route handler
2. **Middleware**: Runs rate limiter, sanitizer, and authenticator
3. **Validation**: Zod schema validates request data
4. **Controller**: Extracts request data and calls service
5. **Service**: Implements business logic and database queries
6. **Model**: Mongoose performs database operations
7. **Response**: Return success/error response to client

---

## Database

### MongoDB Collections

#### Account (Authentication)
```typescript
{
  _id: ObjectId,
  email: string (unique),
  phoneNumber: string (unique),
  password: string (hashed),
  role: "individual" | "charity" | "vendor" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

#### User (Individual & Charity Profiles)
```typescript
{
  _id: ObjectId,
  accountId: ObjectId (ref: Account),
  accountType: "individual" | "charity",
  name: string,
  charityRegNumber?: string (unique, optional),
  charityVerifiedAt?: Date | null,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Vendor (Vendor Profiles)
```typescript
{
  _id: ObjectId,
  accountId: ObjectId (ref: Account, unique),
  businessName: string,
  address: string,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Listing (Food Listings)
```typescript
{
  _id: ObjectId,
  vendorId: ObjectId (ref: Vendor),
  itemDescription: string,
  quantity: number,
  remainingQuantity: number,
  price: number | "free",
  category: "cooked_meal" | "baked_goods" | "raw_produce" | "free_donation",
  pickupByTime: Date,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  state: "active" | "claimed" | "picked_up" | "expired_unclaimed" | "expired_no_show",
  claims: [{
    claimedBy: ObjectId (ref: User),
    claimantType: "individual" | "charity",
    claimedAt: Date,
    holdExpiresAt: Date,
    status: "pending" | "picked_up" | "lapsed"
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

- **User**: 2dsphere index on `location` for geospatial queries
- **Vendor**: 2dsphere index on `location` for geospatial queries
- **Listing**: 
  - 2dsphere index on `location`
  - Compound index on `state` and `pickupByTime`
  - Compound index on `state` and `claims.holdExpiresAt`

### Geospatial Queries

The database uses MongoDB's geospatial capabilities:
- Coordinates stored as [longitude, latitude]
- 2dsphere indexes enable distance-based queries
- Used in feed endpoint to find listings near user

---

## Authentication & Security

### JWT Authentication

**Token Structure**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiI2MDdiMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJyb2xlIjoiaW5kaXZpZHVhbCIsImlhdCI6MTYyNjI0MDAwMCwiZXhwIjoxNjI2ODQ0ODAwfQ.signature
```

**Claims**:
- `accountId`: User's account ID
- `role`: User's role
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

### Token Usage

Include in all protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Access Control (RBAC)

| Role | Can Access |
|---|---|
| individual | Profile, location, listings feed, claim listings |
| charity | Profile, location, listings feed, claim listings (if verified) |
| vendor | Vendor profile, create listings, confirm pickups |
| admin | Verify charities, view pending charities |

### Password Security

- **Hashing**: Bcrypt with configurable salt rounds
- **Salt Rounds**: 10 (default, configurable via BCRYPT_SALT_ROUNDS)
- **Never Stored**: Raw passwords never logged or returned

### Input Sanitization

All inputs are automatically sanitized to prevent:
- XSS (Cross-Site Scripting)
- SQL Injection
- NoSQL Injection

---

## API Overview

### Base URL

```text
/api
```

### Public Routes

```
POST   /api/auth/register    - Create account
POST   /api/auth/login       - Login
```

### Protected Routes

```
GET    /api/users/me                          - Get profile
PATCH  /api/users/me/location                 - Update location
GET    /api/vendors/me                        - Get vendor profile
GET    /api/vendors/dashboard                 - Get dashboard stats
GET    /api/vendors/listings                  - Get vendor listings
POST   /api/listings                          - Create listing
GET    /api/listings                          - Get nearby listings
GET    /api/listings/:id                      - Get listing details
PATCH  /api/listings/:id/claim                - Claim listing
PATCH  /api/listings/:id/confirm-pickup       - Confirm pickup
GET    /api/admin/charities/pending           - Get pending charities
PATCH  /api/admin/charities/:userId/verify    - Verify charity
```

For complete API documentation, see [../docs/API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

---

## Middleware

### Applied to All Routes

#### 1. **Trust Proxy**
```typescript
app.set("trust proxy", 1);
```
Enables proper client IP detection when behind reverse proxy.

#### 2. **Body Parser**
```typescript
app.use(express.json());
```
Parses incoming JSON request bodies.

#### 3. **Input Sanitizer**
```typescript
app.use(sanitizeInputs);
```
Sanitizes all inputs to prevent injection attacks.

#### 4. **Morgan Logger**
```typescript
app.use(morgan("dev"));
```
Logs HTTP requests in development format.

#### 5. **General Rate Limiter**
```typescript
app.use(generalLimiter);
```
- **Window**: 15 minutes
- **Max**: 100 requests per window

#### 6. **Helmet Security Headers**
```typescript
app.use(helmet());
```
Sets security HTTP headers (X-Frame-Options, X-Content-Type-Options, etc.)

#### 7. **CORS Protection**
```typescript
app.use(cors({...}));
```
Only allows requests from configured origins.

### Route-Specific Middleware

#### Auth Routes
```typescript
authLimiter           // 10 requests per 15 minutes
validateRequest       // Zod schema validation
```

#### Claim Routes
```typescript
claimLimiter          // 5 requests per minute
validateRequest       // Zod schema validation
```

#### Protected Routes
```typescript
authenticateUser      // Requires valid JWT token
authorizePermissions  // Checks user role
validateRequest       // Zod schema validation
```

---

## Error Handling

### Custom Error Classes

#### CustomAPIError
Base error class for all API errors.

```typescript
class CustomAPIError extends Error {
  statusCode: number;
  message: string;
}
```

#### BadRequestError (400)
```typescript
throw new BadRequestError("Invalid input data");
```

#### UnauthorizedError (401)
```typescript
throw new UnauthorizedError("Authentication token is required");
```

#### ForbiddenError (403)
```typescript
throw new ForbiddenError("You do not have permission");
```

#### NotFoundError (404)
```typescript
throw new NotFoundError("Resource not found");
```

#### ValidationError (400)
```typescript
throw new ValidationError("Validation failed", errors);
```

### Error Response Format

```json
{
  "success": false,
  "msg": "Error message",
  "errors": []
}
```

### Error Handling Flow

```
Thrown Error
    ↓
Error Middleware
    ↓
Is CustomAPIError?
    ├─ YES → Return with statusCode
    └─ NO  → Return 500 "Something went wrong"
```

---

## Rate Limiting

### Three Rate Limiters

#### 1. General Limiter
- **Applied to**: All routes
- **Window**: 15 minutes
- **Max**: 100 requests
- **Purpose**: Overall API protection

#### 2. Auth Limiter
- **Applied to**: `/auth/register`, `/auth/login`
- **Window**: 15 minutes
- **Max**: 10 requests
- **Purpose**: Prevent brute force attacks

#### 3. Claim Limiter
- **Applied to**: `/listings/:id/claim`
- **Window**: 1 minute
- **Max**: 5 requests
- **Purpose**: Prevent abuse of claiming system

### Rate Limit Response

```json
{
  "success": false,
  "msg": "Too many requests, please try again later."
}
```

HTTP Status: `429 Too Many Requests`

---

## Email Notifications

### Notification Service

Located in `modules/notification/notification.service.ts`

Handles sending emails using Nodemailer with SMTP configuration.

### Email Templates

Located in `modules/notification/email-templates.ts`

Templates for:
- Claim notifications (notify vendor)
- Verification notifications (notify charity)
- Confirmation emails

### SMTP Configuration

Uses environment variables:
- `SMTP_HOST`: Email server host
- `SMTP_PORT`: Email server port
- `SMTP_USER`: Email account username
- `SMTP_PASS`: Email account password/app-password
- `SMTP_FROM`: Sender email address

### Example: Gmail Setup

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@foodshare.com
```

**Note**: Use app-specific password, not account password.

---

## Background Jobs

### Listing Expiration Job

Located in `modules/jobs/expireListings.job.ts`

**Purpose**: Automatically mark listings as expired when pickup time has passed.

**Frequency**: Runs periodically (configured with Node Cron)

**Action**: 
- Finds listings where `pickupByTime` <= now
- Updates state to `expired_unclaimed` or `expired_no_show`
- Based on whether claims exist and hold time expired

**Configuration**:
```typescript
// Runs every minute (example)
cron.schedule('* * * * *', async () => {
  // Expiration logic
});
```

---

## Development Workflow

### 1. Add a New Endpoint

**Step 1: Create validation schema** (`module.validation.ts`)
```typescript
export const requestSchema = z.object({
  field: z.string().min(1),
});
```

**Step 2: Create route** (`module.route.ts`)
```typescript
router.get("/path", authenticateUser, validateRequest({...}), handler);
```

**Step 3: Create controller** (`module.controller.ts`)
```typescript
const handler = asyncWrapper(async (req, res) => {
  const result = await service.doSomething(req.body);
  res.status(200).json({ success: true, result });
});
```

**Step 4: Create service** (`module.service.ts`)
```typescript
export async function doSomething(data: any) {
  // Business logic
  return await Model.findOne({...});
}
```

### 2. Add New Database Model

**Create model** (`module.model.ts`)
```typescript
const schema = new Schema<IInterface>({
  field: { type: String, required: true },
});

export const Model = model<IInterface>("CollectionName", schema);
```

**Add indexes** if needed for performance:
```typescript
schema.index({ field: 1 });
```

### 3. Testing

Currently, testing framework can be added. Suggested approach:

```bash
npm install --save-dev jest @types/jest ts-jest
```

Create test files: `module.test.ts`

```typescript
describe("Module", () => {
  it("should do something", () => {
    expect(result).toBe(expected);
  });
});
```

### 4. Deployment

**Steps**:
1. Build: `npm run build`
2. Set production environment variables
3. Deploy `dist/` folder to hosting
4. Run MongoDB migrations if needed
5. Seed admin account if first deployment

---

## Troubleshooting

### Server won't start

**Check**:
- Node.js version: `node --version`
- npm version: `npm --version`
- Port 5000 available: `netstat -an | grep 5000`

**Solution**:
```bash
# Kill process on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### MongoDB connection failed

**Check**:
- MongoDB is running
- Connection string is correct
- Credentials are valid

**Solution**:
```bash
# Test connection
mongosh "mongodb://localhost:27017"
```

### JWT token issues

**Check**:
- Token in Authorization header
- Token format: "Bearer <token>"
- Token hasn't expired
- SECRET key matches

**Solution**:
```bash
# Get new token
# Login with valid credentials
```

### Rate limit issues

**Check**:
- Requests per timeframe
- Different endpoints have different limits

**Solution**:
```bash
# Wait for window to reset (15 minutes default)
# Or change rate limit in code for testing
```

### Email not sending

**Check**:
- SMTP credentials correct
- SMTP host and port valid
- Firewall not blocking SMTP port
- Less secure apps allowed (Gmail)

**Solution**:
```env
# Verify SMTP settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
```

### TypeScript compilation errors

**Check**:
- TypeScript version
- `tsconfig.json` settings

**Solution**:
```bash
npm install --save-dev typescript@latest
npx tsc --version
```

---

## API Reference

### Full Endpoint List

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | /api/auth/register | ❌ | - | Register new account |
| POST | /api/auth/login | ❌ | - | Login user |
| GET | /api/users/me | ✅ | individual, charity | Get profile |
| PATCH | /api/users/me/location | ✅ | individual, charity | Update location |
| GET | /api/vendors/me | ✅ | vendor | Get vendor profile |
| GET | /api/vendors/dashboard | ✅ | vendor | Get dashboard stats |
| GET | /api/vendors/listings | ✅ | vendor | Get vendor listings |
| POST | /api/listings | ✅ | vendor | Create listing |
| GET | /api/listings | ✅ | all | Get nearby listings |
| GET | /api/listings/:id | ✅ | all | Get listing details |
| PATCH | /api/listings/:id/claim | ✅ | individual, charity | Claim listing |
| PATCH | /api/listings/:id/confirm-pickup | ✅ | vendor | Confirm pickup |
| GET | /api/admin/charities/pending | ✅ | admin | Get pending charities |
| PATCH | /api/admin/charities/:userId/verify | ✅ | admin | Verify charity |

For detailed endpoint documentation including request/response examples, see [../docs/API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

---

## Key Concepts

### Vendor Registration Requirements
When registering a vendor account, the following fields are required:
- **email**: Valid email address
- **phoneNumber**: 10-15 characters
- **password**: Minimum 8 characters
- **role**: Must be "vendor"
- **name**: Full name (minimum 2 characters)
- **businessName**: Business name (minimum 2 characters)
- **address**: Business address (minimum 5 characters) - **NEW FIELD**
- **coordinates**: [longitude, latitude] for business location

**Example vendor registration payload**:
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

### Claim Hold System
- Claims are held for 15 minutes
- Vendor must confirm within hold period
- Hold automatically expires if not confirmed
- Multiple users can claim same listing

### Listing States
- **active**: Available for claiming
- **claimed**: Has active claims
- **picked_up**: All quantity picked up
- **expired_unclaimed**: Past pickup time, no claims
- **expired_no_show**: Past pickup time, claims not honored

### Charity Verification
- Charities register like other users
- Must be verified by admin
- Only verified charities can claim
- Status tracked in `charityVerifiedAt` field

### Geolocation
- Coordinates in [longitude, latitude] format
- 2dsphere indexes for distance queries
- Feed endpoint returns listings by distance

---

## Notes for Developers

1. **Always validate input**: Use Zod schemas for all requests
2. **Handle errors properly**: Use custom error classes
3. **Use async/await**: Wrap async handlers with asyncWrapper
4. **Log important events**: Use Morgan and console logs
5. **Test thoroughly**: Test all edge cases
6. **Follow TypeScript**: Enable strict mode
7. **Keep code modular**: Follow module structure
8. **Document changes**: Update comments and README
9. **Security first**: Never compromise on security
10. **Performance matters**: Use proper indexes and queries


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
