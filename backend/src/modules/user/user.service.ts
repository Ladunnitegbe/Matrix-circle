import { User } from "./user.model";
import { ClientSession } from "mongoose";
import NotFoundError from "../../common/error/not-found-error";
import { Account } from "../auth/auth.model";
import { charityVerifiedTemplate } from "../notification/email-templates";
import { sendEmail } from "../notification/notification.service";

type CreateUserProfileData = {
  accountId: string;
  accountType: "individual" | "charity";
  name: string;
  charityRegNumber?: string;
};

const createUserProfile = async (
  data: CreateUserProfileData,
  session?: ClientSession
) => {
  return User.create(
    [
      {
        accountId: data.accountId,
        accountType: data.accountType,
        name: data.name,
        charityRegNumber: data.charityRegNumber,
      },
    ],
    { session }
  );
};

const getProfileByAccountId = async (accountId: string) => {
  const user = await User.findOne({ accountId });
  if (!user) throw new NotFoundError("User profile not found");
  return user;
};

const verifyCharity = async (userId: string) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, accountType: "charity" },
    { charityVerifiedAt: new Date() },
    { new: true }
  );
  if (!user) throw new NotFoundError("Charity account not found");

  const account = await Account.findById(user.accountId);
  if (account) {
    const { subject, html } = charityVerifiedTemplate(user.name);
    await sendEmail(account.email, subject, html);
  }

  return user;
};

const updateLocation = async (accountId: string, coordinates: [number, number]) => {
  const user = await User.findOneAndUpdate(
    { accountId },
    { location: { type: "Point", coordinates } },
    { new: true }
  );
  if (!user) throw new NotFoundError("User profile not found");
  return user;
};

const findUsersNearLocation = async (coordinates: [number, number], maxDistanceKm = 5) => {
  const users = await User.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistanceKm * 1000,
      },
    },
  });

  const accountIds = users.map((u) => u.accountId);
  const accounts = await Account.find({ _id: { $in: accountIds } }, "email");
  const emailByAccountId = new Map(accounts.map((a) => [a.id.toString(), a.email]));

  return users
    .map((u) => ({ name: u.name, email: emailByAccountId.get(u.accountId.toString()) }))
    .filter((u): u is { name: string; email: string } => Boolean(u.email));
};

export { createUserProfile, getProfileByAccountId, verifyCharity, updateLocation, findUsersNearLocation  };