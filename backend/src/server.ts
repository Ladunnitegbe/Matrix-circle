import "dotenv/config";

import app from "./app";
import connectDB from "./config/db";
import mongoose from "mongoose";
import { startExpiryJob } from "./modules/jobs/expireListings.job";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    startExpiryJob();

    const server = app.listen(PORT, () => {
      console.log(`Server listening to port: ${PORT}`);
    });

    const shutdown = async () => {
      console.log("Shutting down gracefully......");

      server.close(async () => {
        console.log("Closed out remaining server connections.");

        await mongoose.connection.close();
        console.log("MongoDB connection closed");

        process.exit(0);
      });
      setTimeout(() => {
        console.error("Forcing shutdown after 10 seconds");
        process.exit(1);
      }, 10000);
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};
startServer();
