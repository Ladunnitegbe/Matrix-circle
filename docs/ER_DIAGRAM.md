# Entity Relationship Diagram

```mermaid
erDiagram
  ACCOUNT {
    string email
    string phoneNumber
    string password
    string role
    date createdAt
    date updatedAt
  }

  USER {
    ObjectId accountId
    string accountType
    string name
    string charityRegNumber
    date charityVerifiedAt
    object location
    date createdAt
    date updatedAt
  }

  VENDOR {
    ObjectId accountId
    string businessName
    object location
    date createdAt
    date updatedAt
  }

  ACCOUNT ||--o| USER : "has one optional profile"
  ACCOUNT ||--o| VENDOR : "has one optional profile"
```

Notes from the current schema:
- `User.accountId` and `Vendor.accountId` are both `required` and `unique` references to `Account`.
- In this implementation, an `Account` is expected to have either a `User` profile or a `Vendor` profile, not both.

| Planned model | Status | Note |
| --- | --- | --- |
| Listing | Planned | Scheduled for later in the sprint. |
| Claim | Planned | Scheduled for later in the sprint. |
