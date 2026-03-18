import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { Admin } from "../models/Admin.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized. Token required." });
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const admin = await Admin.findById(decoded.sub).populate("role");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found." });
    }
    if (admin.status !== "active" && !admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Account is not active." });
    }
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
    next(err);
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin?.isSuperAdmin) {
    return res.status(403).json({ success: false, message: "Super Admin access required." });
  }
  next();
};
