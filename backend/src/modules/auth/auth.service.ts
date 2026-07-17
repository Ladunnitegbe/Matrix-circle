import bcrypt from "bcrypt";
import { Account } from "./auth.model";
import BadRequestError from "../../common/error/bad-request";
import UnauthorizedError from "../../common/error/unauthorized-error";
import { createAccessToken } from "../../common/utils/jwt";
import { createUserProfile } from "../user/user.service";
import { createVendorProfile } from "../vendor/vendor.service";

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

const register = async (data: RegisterData) => {
  const existing = await Account.findOne({
    $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
  });

  if (existing) {
    const field = existing.email === data.email ? "Email" : "Phone number";
    throw new BadRequestError(`${field} already registered`);
  }

  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);

  const account = await Account.create({
    email: data.email,
    phoneNumber: data.phoneNumber,
    password: hashed,
    role: data.role,
  });

  if (data.role === "individual" || data.role === "charity") {
    await createUserProfile({
      accountId: account.id,
      accountType: data.role,
      name: data.name,
      charityRegNumber: data.charityRegNumber,
    });
  }

  if (data.role === "vendor") {
    if (!data.businessName || !data.coordinates) {
      throw new BadRequestError("businessName and coordinates are required for vendor registration");
    }
    await createVendorProfile({
      accountId: account.id,
      businessName: data.businessName,
      coordinates: data.coordinates,
    });
  }

  const token = createAccessToken({ userId: account.id, role: account.role });

  return {
    token,
    account: { id: account.id, email: account.email, role: account.role },
  };
};

const login = async (data: LoginData) => {
  const account = await Account.findOne({ email: data.email });
  if (!account) throw new UnauthorizedError("Invalid credentials");

  const match = await bcrypt.compare(data.password, account.password);
  if (!match) throw new UnauthorizedError("Invalid credentials");

  const token = createAccessToken({ userId: account.id, role: account.role });

  return {
    token,
    account: { id: account.id, email: account.email, role: account.role },
  };
};

export { register, login };