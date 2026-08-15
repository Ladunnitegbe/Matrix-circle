import { Schema, model, Document, Types } from "mongoose";

export interface IVendor extends Document {
  id: string;
  accountId: Types.ObjectId;
  businessName: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: true, versionKey: false }
);

vendorSchema.index({ location: "2dsphere" }); 
export const Vendor = model<IVendor>("Vendor", vendorSchema);