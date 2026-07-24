import "dotenv/config";
import bcrypt from "bcrypt";
import connectDB from "../config/db";
import { Account } from "../modules/auth/auth.model";
import mongoose from "mongoose";

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const phoneNumber = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);

  if (!email || !phoneNumber || !password || !saltRounds) {
    throw new Error("ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD, and BCRYPT_SALT_ROUNDS must be set in .env");
  }

  const existing = await Account.findOne({ role: "admin" });
  if (existing) {
    console.log("An admin account already exists — skipping.");
    await mongoose.connection.close();
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, saltRounds);

  await Account.create({
    email,
    phoneNumber,
    password: hashed,
    role: "admin",
  });

  console.log(`Admin account created: ${email}`);
  await mongoose.connection.close();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});