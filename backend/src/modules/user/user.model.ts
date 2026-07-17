import { Schema, model, Document, Types } from "mongoose";

export type AccountType = "individual" | "charity";

export interface IUser extends Document {
  accountId: Types.ObjectId;
  accountType: AccountType;
  name: string;
  charityRegNumber?: string;
  charityVerifiedAt?: Date | null; 
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
    accountType: { type: String, enum: ["individual", "charity"], required: true },
    name: { type: String, required: true, trim: true },
    charityRegNumber: { type: String, trim: true },
    charityVerifiedAt: { type: Date, default: null },
    location: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ location: "2dsphere" });

export const User = model<IUser>("User", userSchema);