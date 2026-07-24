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

  const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

  const listing = await Listing.findOneAndUpdate(
    { _id: listingId, state: "active" },
    {
      state: "claimed",
      claim: {
        claimedBy: user.id,
        claimantType: user.accountType,
        claimedAt: new Date(),
        holdExpiresAt,
      },
    },
    { new: true }
  );

  if (!listing) throw new BadRequestError("This listing is no longer available");

  return listing;
};

const confirmPickup = async (vendorAccountId: string, listingId: string) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new NotFoundError("Listing not found");

  const vendor = await getVendorProfile(vendorAccountId);

  if (listing.vendorId.toString() !== vendor.id.toString()) {
    throw new ForbiddenError("You do not have permission to confirm this listing");
  }

  if (listing.state !== "claimed") {
    throw new BadRequestError("This listing has no active claim to confirm");
  }

  listing.state = "picked_up";
  await listing.save();

  return listing;
};

export { claimListing, confirmPickup };