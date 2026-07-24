import cron from "node-cron";
import { Listing } from "../listing/listing.model";

const sweepExpiredListings = async () => {
  const now = new Date();

  // Never claimed, pickup window passed
  await Listing.updateMany(
    { state: "active", pickupByTime: { $lt: now } },
    { state: "expired_unclaimed" }
  );

  // Claimed, hold lapsed
  const lapsed = await Listing.find({ state: "claimed", "claim.holdExpiresAt": { $lt: now } });

  for (const listing of lapsed) {
    if (listing.pickupByTime > now) {
      listing.state = "active";
      listing.claim = undefined;
    } else {
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