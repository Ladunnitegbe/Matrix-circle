# Entity Relationship Diagram


```mermaid
erDiagram

ACCOUNT {
  ObjectId _id
  string email
  string phoneNumber
  string password
  string role
  date createdAt
  date updatedAt
}

USER {
  ObjectId _id
  ObjectId accountId
  string accountType
  string name
  string charityRegNumber
  date charityVerifiedAt
  Point location
  date createdAt
  date updatedAt
}

VENDOR {
  ObjectId _id
  ObjectId accountId
  string businessName
  Point location
  date createdAt
  date updatedAt
}

LISTING {
  ObjectId _id
  ObjectId vendorId
  string itemDescription
  number quantity
  mixed price
  string category
  date pickupByTime
  Point location
  string state
  ObjectId claim_claimedBy "embedded, references User._id, present only when state = claimed"
  string claim_claimantType "embedded, present only when claimed"
  date claim_claimedAt "embedded, present only when claimed"
  date claim_holdExpiresAt "embedded, present only when claimed"
  date createdAt
  date updatedAt
}

ACCOUNT ||--o| USER : owns
ACCOUNT ||--o| VENDOR : owns
VENDOR ||--o{ LISTING : creates
```

## Relationships

- Every Account owns exactly one User profile or one Vendor profile.
- A Vendor can create many Listings.
- Claim data is embedded directly on each Listing (see the `claim_*` fields) — there is no separate Claim collection. These fields are only populated once a listing's `state` becomes `claimed`.
- Listings use MongoDB GeoJSON (`2dsphere`) indexes for location-based searches.