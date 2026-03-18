import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "./config/index.js";
import authRoutes from "./routes/authRoutes.js";
import adminsRoutes from "./routes/adminsRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import auditLogsRoutes from "./routes/auditLogsRoutes.js";
import { seedSuperAdminIfNeeded } from "./scripts/seedSuperAdmin.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/superadmin/auth", authRoutes);
app.use("/superadmin/admins", adminsRoutes);
app.use("/superadmin/roles", rolesRoutes);
app.use("/superadmin/audit-logs", auditLogsRoutes);

app.get("/superadmin/health", (req, res) => {
  res.json({ success: true, message: "Super Admin API is running." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

async function start() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected.");
    await seedSuperAdminIfNeeded();
    app.listen(config.port, () => {
      console.log(`Super Admin API listening on port ${config.port}`);
    });
  } catch (e) {
    const isMongo = e.name === "MongooseServerSelectionError" || (e.cause && e.cause.code === "ECONNREFUSED");
    if (isMongo) {
      console.error("\nMongoDB connection failed. Either:");
      console.error("  1. Install and start MongoDB locally: https://www.mongodb.com/try/download/community");
      console.error("  2. Or use MongoDB Atlas (free): create a cluster at https://cloud.mongodb.com and set MONGODB_URI in .env");
      console.error("\nCurrent MONGODB_URI:", config.mongodbUri);
    }
    console.error("\nStartup error:", e.message);
    process.exit(1);
  }
}

start();
