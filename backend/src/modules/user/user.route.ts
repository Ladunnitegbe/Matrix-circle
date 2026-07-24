import { Router } from "express";
import { getMyProfile, updateMyLocation } from "./user.controller";
import { authenticateUser } from "../../common/middleware/isAuth";
import validateRequest from "../../common/middleware/validation-request";
import { updateLocationSchema } from "./user.validation";

const router = Router();

router.get("/me", authenticateUser, getMyProfile);
router.patch("/me/location", authenticateUser, validateRequest({ body: updateLocationSchema }), updateMyLocation);

export default router;