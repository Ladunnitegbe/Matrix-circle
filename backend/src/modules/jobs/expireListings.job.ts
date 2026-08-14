import cron from "node-cron";
import { Listing } from "../listing/listing.model";

const sweepExpiredListings = async () => {
  const now = new Date();

  await Listing.updateMany(
    { state: "active", remainingQuantity: { $gt: 0 }, pickupByTime: { $lt: now } },
    { state: "expired_unclaimed" }
  );

  const listingsWithLapsedClaims = await Listing.find({
    "claims.status": "pending",
    "claims.holdExpiresAt": { $lt: now },
  });

  for (const listing of listingsWithLapsedClaims) {
    let releasedAny = false;

    for (const claimEntry of listing.claims) {
      if (claimEntry.status === "pending" && claimEntry.holdExpiresAt < now) {
        if (listing.pickupByTime > now) {
          claimEntry.status = "lapsed";
          listing.remainingQuantity += 1;
          releasedAny = true;
        } else {
          claimEntry.status = "lapsed";
        }
      }
    }

    if (releasedAny && listing.state === "claimed" && listing.remainingQuantity > 0) {
      listing.state = "active";
    }

    if (listing.remainingQuantity === 0 && listing.pickupByTime <= now) {
      listing.state = "expired_no_show";
    }

    await listing.save();
  }
};

const startExpiryJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      await sweepExpiredListings();
    } catch (err) {
      console.error("Expiry sweep failed:", err);
    }
  });
  console.log("Listing expiry sweep job started");
};

export { startExpiryJob, sweepExpiredListings };