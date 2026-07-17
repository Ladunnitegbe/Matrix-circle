import { User } from "./user.model";
import NotFoundError from "../../common/error/not-found-error";

type CreateUserProfileData = {
  accountId: string;
  accountType: "individual" | "charity";
  name: string;
  charityRegNumber?: string;
};

const createUserProfile = async (data: CreateUserProfileData) => {
  return User.create({
    accountId: data.accountId,
    accountType: data.accountType,
    name: data.name,
    charityRegNumber: data.charityRegNumber,
  });
};

const getProfileByAccountId = async (accountId: string) => {
  const user = await User.findOne({ accountId });
  if (!user) throw new NotFoundError("User profile not found");
  return user;
};

export { createUserProfile, getProfileByAccountId };