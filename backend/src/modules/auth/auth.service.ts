import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Account, IAccount } from "./auth.model";
import BadRequestError from "../../common/error/bad-request";
import UnauthorizedError from "../../common/error/unauthorized-error";
import { createAccessToken } from "../../common/utils/jwt";
import { createUserProfile } from "../user/user.service";
import { createVendorProfile } from "../vendor/vendor.service";
import { sendEmail } from "../notification/notification.service";
import {
  charityPendingTemplate,
  adminNewCharityTemplate,
} from "../notification/email-templates";

type RegisterData = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "individual" | "charity" | "vendor";
  charityRegNumber?: string;
  businessName?: string;
  coordinates?: [number, number];
};

type LoginData = {
  email: string;
  password: string;
};

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS);
if (!SALT_ROUNDS || isNaN(SALT_ROUNDS)) {
  throw new Error("BCRYPT_SALT_ROUNDS must be set to a valid number in .env");
}

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  phoneNumber: "Phone number",
};

const register = async (data: RegisterData) => {
  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);

  const session = await mongoose.startSession();

  try {
    let createdAccount!: IAccount;

    await session.withTransaction(async () => {
      const accounts = await Account.create(
        [
          {
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: hashed,
            role: data.role,
          },
        ],
        { session },
      );

      createdAccount = accounts[0];

      if (data.role === "individual" || data.role === "charity") {
        if (data.role === "charity" && !data.charityRegNumber) {
          throw new BadRequestError(
            "charityRegNumber is required for charity registration",
          );
        }
        await createUserProfile(
          {
            accountId: createdAccount.id,
            accountType: data.role,
            name: data.name,
            charityRegNumber: data.charityRegNumber,
          },
          session,
        );
      }

      if (data.role === "vendor") {
        if (!data.businessName || !data.coordinates) {
          throw new BadRequestError(
            "businessName and coordinates are required for vendor registration",
          );
        }

        await createVendorProfile(
          {
            accountId: createdAccount.id,
            businessName: data.businessName,
            coordinates: data.coordinates,
          },
          session,
        );
      }
    });

    if (data.role === "charity") {
      const { subject, html } = charityPendingTemplate(data.name);

      void sendEmail(data.email, subject, html).catch((err) => {
        console.error("Failed to send charity email:", err);
      });

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const admin = adminNewCharityTemplate(
          data.name,
          data.charityRegNumber!,
        );
        void sendEmail(adminEmail, admin.subject, admin.html).catch((err) =>
          console.error("Failed to notify admin:", err),
        );
      }
    }

    const token = createAccessToken({
      accountId: createdAccount.id,
      role: createdAccount.role,
    });

    return {
      token,
      account: {
        id: createdAccount.id,
        email: createdAccount.email,
        role: createdAccount.role,
      },
    };
  } catch (err: any) {
    if (err.code === 11000) {
      const rawField = Object.keys(err.keyPattern ?? {})[0];
      const label = FIELD_LABELS[rawField] ?? rawField;
      throw new BadRequestError(`${label} already registered`);
    }

    throw err;
  } finally {
    await session.endSession();
  }
};

const login = async (data: LoginData) => {
  const account = await Account.findOne({ email: data.email }).select(
    "+password",
  );
  if (!account) throw new UnauthorizedError("Invalid credentials");

  const match = await bcrypt.compare(data.password, account.password);
  if (!match) throw new UnauthorizedError("Invalid credentials");

  const token = createAccessToken({
    accountId: account.id,
    role: account.role,
  });

  return {
    token,
    account: { id: account.id, email: account.email, role: account.role },
  };
};

export { register, login };
