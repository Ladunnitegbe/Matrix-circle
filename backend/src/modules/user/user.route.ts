import { Router } from "express";
import { getMyProfile } from "./user.controller";
import { authenticateUser } from "../../common/middleware/isAuth";

const router = Router();

router.get("/me", authenticateUser, getMyProfile);

export default router;