import { PERMISSIONS } from "../constants/permissions.js";

export const requirePermission = (permission) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  if (req.admin.isSuperAdmin) {
    return next();
  }
  const role = req.admin.role;
  const hasPermission = role?.permissions?.includes(permission);
  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      message: `Permission denied. Required: ${permission}`,
    });
  }
  next();
};

export const requireAnyPermission = (permissions) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  if (req.admin.isSuperAdmin) return next();
  const role = req.admin.role;
  const hasAny = permissions.some((p) => role?.permissions?.includes(p));
  if (!hasAny) {
    return res.status(403).json({
      success: false,
      message: "Permission denied.",
    });
  }
  next();
};
