import { Router } from "express";
import { claim, confirmPickup } from "./claim.controller";
import { authenticateUser, authorizePermissions } from "../../common/middleware/isAuth";
import { claimLimiter } from "../../common/middleware/rateLimiter.middleware";
import validateRequest from "../../common/middleware/validation-request";
import { listingIdParamsSchema } from "./claim.validation";


const router = Router();

router.patch(
  "/:id/claim",
  authenticateUser,
  authorizePermissions("individual", "charity"),
  claimLimiter,
  validateRequest({ params: listingIdParamsSchema }),
  claim
);

router.patch(
  "/:id/confirm-pickup",
  authenticateUser,
  authorizePermissions("vendor"),
  validateRequest({ params: listingIdParamsSchema }),
  confirmPickup
);

export default router;