import { ClientSession } from "mongoose";
import NotFoundError from "../../common/error/not-found-error";
import { Listing } from "../listing/listing.model";
import { Vendor } from "./vendor.model";

type CreateVendorProfileData = {
  accountId: string;
  businessName: string;
  coordinates: [number, number];
};

const createVendorProfile = async (
  data: CreateVendorProfileData,
  session?: ClientSession
) => {
  return Vendor.create(
    [
      {
        accountId: data.accountId,
        businessName: data.businessName,
        location: {
          type: "Point",
          coordinates: data.coordinates,
        },
      },
    ],
    { session }
  );
};

const getProfileByAccountId = async (accountId: string) => {
  const vendor = await Vendor.findOne({ accountId });
  if (!vendor) throw new NotFoundError("Vendor profile not found");
  return vendor;
};

const getVendorDashboard = async (vendorId: string) => {
  const [claimed, discarded] = await Promise.all([
    Listing.countDocuments({ vendorId, state: "picked_up" }),
    Listing.countDocuments({ vendorId, state: { $in: ["expired_unclaimed", "expired_no_show"] } }),
  ]);
  return { claimed, discarded };
};

const getVendorListings = async (vendorId: string) => {
  return Listing.find({ vendorId })
    .sort({ createdAt: -1 })
    .populate("claim.claimedBy", "name accountType");
};

export { createVendorProfile, getProfileByAccountId, getVendorDashboard, getVendorListings };