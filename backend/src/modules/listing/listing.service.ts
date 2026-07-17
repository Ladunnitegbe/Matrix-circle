import { FilterQuery } from "mongoose";
import { Listing, IListing, ListingCategory } from "./listing.model";
import { getProfileByAccountId } from "../vendor/vendor.service";
import NotFoundError from "../../common/error/not-found-error";

type CreateListingInput = {
  itemDescription: string;
  quantity: number;
  price: number | "free";
  category: ListingCategory;
  pickupByTime: Date;
  coordinates: [number, number];
};

const createListing = async (accountId: string, input: CreateListingInput) => {
  const vendor = await getProfileByAccountId(accountId); 

  return Listing.create({
    vendorId: vendor.id,
    itemDescription: input.itemDescription,
    quantity: input.quantity,
    price: input.price,
    category: input.category,
    pickupByTime: input.pickupByTime,
    location: { type: "Point", coordinates: input.coordinates },
  });
};

type FeedFilters = {
  lat: number;
  lng: number;
  maxDistanceKm: number;
  category?: ListingCategory;
};

const getFeed = async (filters: FeedFilters) => {
  const query: FilterQuery<IListing> = {
    state: "active",
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [filters.lng, filters.lat] },
        $maxDistance: filters.maxDistanceKm * 1000,
      },
    },
  };

  if (filters.category) query.category = filters.category;

  return Listing.find(query).sort({ pickupByTime: 1 });
};

const getListingById = async (id: string) => {
  const listing = await Listing.findById(id);
  if (!listing) throw new NotFoundError("Listing not found");
  return listing;
};

export { createListing, getFeed, getListingById };