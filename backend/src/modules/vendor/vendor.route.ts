import { Router } from "express";
import { getDashboard, getMyProfile, getMyListings } from "./vendor.controller";
import { authenticateUser, authorizePermissions } from "../../common/middleware/isAuth";

const router = Router();

router.get("/me", authenticateUser, authorizePermissions("vendor"), getMyProfile);
router.get("/dashboard", authenticateUser, authorizePermissions("vendor"), getDashboard);
router.get("/listings", authenticateUser, authorizePermissions("vendor"), getMyListings);

export default router;