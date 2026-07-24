import { verifyCharity } from "../user/user.service";

const approveCharityVerification = async (userId: string) => {
  return verifyCharity(userId);
};

export { approveCharityVerification };