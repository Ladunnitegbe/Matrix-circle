import { Router } from "express";
import { approveCharity, getPendingCharities } from "./admin.controller";
import { authenticateUser, authorizePermissions } from "../../common/middleware/isAuth";
import validateRequest from "../../common/middleware/validation-request";
import { charityUserIdParamsSchema } from "./admin.validation";

const router = Router();

router.patch(
  "/charities/:userId/verify",
  authenticateUser,
  authorizePermissions("admin"),
  validateRequest({ params: charityUserIdParamsSchema }),
  approveCharity,
);

router.get("/charities/pending", authenticateUser, authorizePermissions("admin"), getPendingCharities);

export default router;