import { Router } from "express";
import { register, login } from "./auth.controller";
import { authLimiter } from "../../common/middleware/rateLimiter.middleware";
import { loginBodySchema, registerBodySchema } from "./auth.validation";
import validateRequest from "../../common/middleware/validation-request";

const router = Router();

// auth.route.ts
router.post("/register", authLimiter, validateRequest({ body: registerBodySchema }), register);
router.post("/login", authLimiter, validateRequest({ body: loginBodySchema }), login);

export default router;