import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import sanitizeInputs from "./common/middleware/sanitize";
import errorHandler from "./common/middleware/error-handler";
import { generalLimiter } from "./common/middleware/rateLimiter.middleware";
import authRoutes from "./modules/auth/auth.route"
import userRoutes from "./modules/user/user.route"
import vendorRoutes from "./modules/vendor/vendor.route";
import listingRoutes from "./modules/listing/listing.route";
import claimRoutes from "./modules/claim/claim.route";
import adminRoutes from "./modules/admin/admin.route";

const app = express();

app.use(express.json());
app.use(sanitizeInputs); 
app.use(morgan("dev"));
app.use(generalLimiter);
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/listings", claimRoutes);
app.use("/api/admin", adminRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, msg: "Route not found" });
});



app.use(errorHandler);

export default app;
