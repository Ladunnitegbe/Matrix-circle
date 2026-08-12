import { Router } from "express";
import { approveCharity, getPendingCharities } from "./admin.controller";
import { authenticateUser, authorizePermissions } from "../../common/middleware/isAuth";

const router = Router();

router.patch(
  "/charities/:userId/verify",
  authenticateUser,
  authorizePermissions("admin"),
  approveCharity,
);


router.get("/charities/pending", authenticateUser, authorizePermissions("admin"), getPendingCharities);

export default router