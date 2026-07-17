import { Router } from "express";
import { getMyProfile } from "./vendor.controller";
import { authenticateUser, authorizePermissions } from "../../common/middleware/isAuth";

const router = Router();

router.get("/me", authenticateUser, authorizePermissions("vendor"), getMyProfile);

export default router;