import cron from "node-cron";
import { Listing } from "../listing/listing.model";

const sweepExpiredListings = async () => {
  const now = new Date();

  // Listings that never got any claims at all, deadline passed
  await Listing.updateMany(
    { state: "active", remainingQuantity: { $gt: 0 }, pickupByTime: { $lt: now } },
    { state: "expired_unclaimed" }
  );

  // Individual claims within any listing whose hold lapsed
  const listingsWithLapsedClaims = await Listing.find({
    "claims.status": "pending",
    "claims.holdExpiresAt": { $lt: now },
  });

  for (const listing of listingsWithLapsedClaims) {
    let releasedAny = false;

    for (const claimEntry of listing.claims) {
      if (claimEntry.status === "pending" && claimEntry.holdExpiresAt < now) {
        if (listing.pickupByTime > now) {
          // still time left — release this portion back to the pool
          claimEntry.status = "lapsed";
          listing.remainingQuantity += 1;
          releasedAny = true;
        } else {
          claimEntry.status = "lapsed"; // too late overall, just mark it lapsed, don't release
        }
      }
    }

    if (releasedAny && listing.state === "claimed" && listing.remainingQuantity > 0) {
      listing.state = "active"; // reopen on the feed if it had been fully claimed but now has room again
    }

    if (listing.remainingQuantity === 0 && listing.pickupByTime <= now) {
      listing.state = "expired_no_show";
    }

    await listing.save();
  }
};

export { sweepExpiredListings };