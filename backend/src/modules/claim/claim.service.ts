import { Listing } from "../listing/listing.model";
import { getProfileByAccountId as getUserProfile } from "../user/user.service";
import { getProfileByAccountId as getVendorProfile } from "../vendor/vendor.service";
import BadRequestError from "../../common/error/bad-request";
import ForbiddenError from "../../common/error/forbidden-error";
import NotFoundError from "../../common/error/not-found-error";

const HOLD_DURATION_MS = 15 * 60 * 1000;

const claimListing = async (accountId: string, listingId: string) => {
  const user = await getUserProfile(accountId);

  if (user.accountType === "charity" && !user.charityVerifiedAt) {
    throw new ForbiddenError("Charity account pending verification — claiming is not yet available");
  }

  
  const hasAnyPendingClaim = await Listing.exists({
    "claims.claimedBy": user.id,
    "claims.status": "pending",
  });
  if (hasAnyPendingClaim) {
    throw new BadRequestError(
      "You already have a pending claim. Complete pickup or wait for it to expire before claiming again."
    );
  }

  const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

  const listing = await Listing.findOneAndUpdate(
    { _id: listingId, state: "active", remainingQuantity: { $gte: 1 } },
    {
      $inc: { remainingQuantity: -1 },
      $push: {
        claims: {
          claimedBy: user.id,
          claimantType: user.accountType,
          claimedAt: new Date(),
          holdExpiresAt,
          status: "pending",
        },
      },
    },
    { new: true }
  );

  if (!listing) throw new BadRequestError("No portions of this listing are available");

  if (listing.remainingQuantity === 0) {
    listing.state = "claimed";
    await listing.save();
  }

  return listing;
};

const confirmPickup = async (vendorAccountId: string, listingId: string, claimantUserId: string) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new NotFoundError("Listing not found");

  const vendor = await getVendorProfile(vendorAccountId);
  if (listing.vendorId.toString() !== vendor.id.toString()) {
    throw new ForbiddenError("You do not have permission to confirm this listing");
  }

  const claimEntry = listing.claims.find(
    (c) => c.claimedBy.toString() === claimantUserId && c.status === "pending"
  );
  if (!claimEntry) {
    throw new BadRequestError("No pending claim found for this claimant on this listing");
  }

  claimEntry.status = "picked_up";

  // Only mark the whole listing "picked_up" once EVERY portion is
  // accounted for — no stock left, and no other claim still pending.
  const anyStillPending = listing.claims.some((c) => c.status === "pending");
  if (listing.remainingQuantity === 0 && !anyStillPending) {
    listing.state = "picked_up";
  }

  await listing.save();
  return listing;
};

export { claimListing, confirmPickup };