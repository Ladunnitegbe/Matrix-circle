import NotFoundError from "../../common/error/not-found-error";
import { Vendor } from "./vendor.model";

type CreateVendorProfileData = {
  accountId: string;
  businessName: string;
  coordinates: [number, number];
};

const createVendorProfile = async (data: CreateVendorProfileData) => {
  return Vendor.create({
    accountId: data.accountId,
    businessName: data.businessName,
    location: { type: "Point", coordinates: data.coordinates },
  });
};

const getProfileByAccountId = async (accountId: string) => {
  const vendor = await Vendor.findOne({ accountId });
  if (!vendor) throw new NotFoundError("Vendor profile not found");
  return vendor;
};

export { createVendorProfile, getProfileByAccountId };