import { AuditLog } from "../models/AuditLog.js";

export async function createAuditLog(adminId, adminEmail, action, module, metadata = {}, req = null) {
  try {
    await AuditLog.create({
      adminId,
      adminEmail,
      action,
      module,
      metadata,
      ip: req?.ip || req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim(),
      userAgent: req?.get?.("user-agent"),
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}
