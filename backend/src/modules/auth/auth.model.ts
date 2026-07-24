import { Schema, model, Document } from "mongoose";

export type AccountRole = "individual" | "charity" | "vendor" | "admin";

export interface IAccount extends Document {
  id: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: AccountRole;
  createdAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true, },
    password: { type: String, required: true, select:false },
    role: { type: String, enum: ["individual", "charity", "vendor", "admin"], required: true },
  },
  { timestamps: true, versionKey: false }
);

export const Account = model<IAccount>("Account", accountSchema);