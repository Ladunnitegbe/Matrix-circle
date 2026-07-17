import { Router } from "express";
import { create, feed, getOne } from "./listing.controller";
import { authenticateUser, authorizePermissions } from "../../common/middleware/isAuth";
import validateRequest from "../../common/middleware/validation-request";
import { createListingBodySchema, feedQuerySchema } from "./listing.validation";

const router = Router();

router.post(
  "/",
  authenticateUser,
  authorizePermissions("vendor"),
  validateRequest({ body: createListingBodySchema }),
  create
);

router.get("/", authenticateUser, validateRequest({ query: feedQuerySchema }), feed);
router.get("/:id", authenticateUser, getOne);

export default router;