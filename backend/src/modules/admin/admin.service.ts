import { verifyCharity, getPendingCharities } from "../user/user.service";

const approveCharityVerification = async (userId: string) => {
  return verifyCharity(userId);
};

const listPendingCharities = async () => {
  return getPendingCharities();
};

export { approveCharityVerification, listPendingCharities };