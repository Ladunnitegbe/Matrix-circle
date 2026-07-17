import express from "express";
import cors from "cors";
import morgan from "morgan";
import sanitizeInputs from "./common/middleware/sanitize";
import errorHandler from "./common/middleware/error-handler";
import { generalLimiter } from "./common/middleware/rateLimiter.middleware";
import authRoutes from "./modules/auth/auth.route"
import userRoutes from "./modules/user/user.route"
import vendorRoutes from "./modules/vendor/vendor.route";
import listingRoutes from "./modules/listing/listing.route";

const app = express();

app.use(express.json());
app.use(sanitizeInputs); 
app.use(morgan("dev"));
app.use(generalLimiter);
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/listings", listingRoutes);


app.use((req, res) => {
  res.status(404).json({ success: false, msg: "Route not found" });
});



app.use(errorHandler);

export default app;
