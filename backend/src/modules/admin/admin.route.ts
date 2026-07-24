import { Router } from "express";
import { approveCharity } from "./admin.controller";
import { authenticateUser, authorizePermissions } from "../../common/middleware/isAuth";

const router = Router();

router.patch(
  "/charities/:userId/verify",
  authenticateUser,
  authorizePermissions("admin"),
  approveCharity,
);

export default router