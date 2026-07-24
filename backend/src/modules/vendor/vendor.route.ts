import { Router } from "express";
import { getDashboard, getMyProfile } from "./vendor.controller";
import { authenticateUser, authorizePermissions } from "../../common/middleware/isAuth";

const router = Router();

router.get("/me", authenticateUser, authorizePermissions("vendor"), getMyProfile);
router.get("/dashboard", authenticateUser, authorizePermissions("vendor"), getDashboard);

export default router;