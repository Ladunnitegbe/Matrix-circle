import { Schema, model, Document, Types } from "mongoose";

export type ListingState = "active" | "claimed" | "picked_up" | "expired_unclaimed" | "expired_no_show";
export type ListingCategory = "cooked_meal" | "baked_goods" | "raw_produce" | "free_donation";
export type ClaimStatus = "pending" | "picked_up" | "lapsed";

interface IClaimEntry {
  claimedBy: Types.ObjectId;
  claimantType: "individual" | "charity";
  claimedAt: Date;
  holdExpiresAt: Date;
  status: ClaimStatus;
}

export interface IListing extends Document {
  vendorId: Types.ObjectId;
  itemDescription: string;
  quantity: number;            
  remainingQuantity: number;   
  price: number | "free";
  category: ListingCategory;
  pickupByTime: Date;
  location: { type: "Point"; coordinates: [number, number] };
  state: ListingState;         
  claims: IClaimEntry[];
  createdAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    itemDescription: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    price: { type: Schema.Types.Mixed, default: "free" },
    category: {
      type: String,
      enum: ["cooked_meal", "baked_goods", "raw_produce", "free_donation"],
      required: true,
    },
    pickupByTime: { type: Date, required: true },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
    state: {
      type: String,
      enum: ["active", "claimed", "picked_up", "expired_unclaimed", "expired_no_show"],
      default: "active",
    },
    claims: [
      {
        claimedBy: { type: Schema.Types.ObjectId, ref: "User" },
        claimantType: { type: String, enum: ["individual", "charity"] },
        claimedAt: { type: Date },
        holdExpiresAt: { type: Date },
        status: { type: String, enum: ["pending", "picked_up", "lapsed"], default: "pending" },
      },
    ],
  },
  { timestamps: true }
);

listingSchema.index({ location: "2dsphere" });
listingSchema.index({ state: 1, pickupByTime: 1 });
listingSchema.index({ state: 1, "claims.holdExpiresAt": 1 });

export const Listing = model<IListing>("Listing", listingSchema);