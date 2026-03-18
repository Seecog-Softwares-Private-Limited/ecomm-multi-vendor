import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { Admin } from "../models/Admin.js";
import { createAuditLog } from "../utils/audit.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select("+password").populate("role");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    const valid = await admin.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (!admin.isSuperAdmin && admin.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval.",
      });
    }
    if (!admin.isSuperAdmin && admin.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }
    const token = jwt.sign(
      { sub: admin._id.toString(), email: admin.email, isSuperAdmin: admin.isSuperAdmin },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    await Admin.findByIdAndUpdate(admin._id, { lastLoginAt: new Date() });
    await createAuditLog(admin._id, admin.email, "login", "auth", {}, req);
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isSuperAdmin: admin.isSuperAdmin,
          status: admin.status,
          approvalStatus: admin.approvalStatus,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
