import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/super_admin_db",
  jwt: {
    secret: process.env.JWT_SECRET || "super-admin-jwt-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  nodeEnv: process.env.NODE_ENV || "development",
};
