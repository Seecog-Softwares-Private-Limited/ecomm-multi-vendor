import { Admin } from "../models/Admin.js";
import { Role } from "../models/Role.js";
import { createAuditLog } from "../utils/audit.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function listAdmins(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
    const search = (req.query.search || "").trim();
    const status = req.query.status;
    const approvalStatus = req.query.approvalStatus;
    const roleId = req.query.roleId;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (roleId) filter.role = roleId;

    const [items, total] = await Promise.all([
      Admin.find(filter).populate("role", "name permissions").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Admin.countDocuments(filter),
    ]);

    const admins = items.map((a) => ({
      id: a._id,
      name: a.name,
      email: a.email,
      role: a.role,
      status: a.status,
      approvalStatus: a.approvalStatus,
      isSuperAdmin: a.isSuperAdmin,
      createdAt: a.createdAt,
      lastLoginAt: a.lastLoginAt,
    }));

    res.json({
      success: true,
      data: {
        admins,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdmin(req, res, next) {
  try {
    const { name, email, password, roleId, status, approvalStatus } = req.body;
    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ success: false, message: "name, email, password and roleId are required." });
    }
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }
    const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }
    const admin = await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: roleId,
      status: status || "inactive",
      approvalStatus: approvalStatus || "pending",
    });
    await admin.populate("role", "name permissions");
    await createAuditLog(req.admin._id, req.admin.email, "create_admin", "admins", { adminId: admin._id, email: admin.email }, req);
    res.status(201).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
          approvalStatus: admin.approvalStatus,
          createdAt: admin.createdAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, roleId, status, approvalStatus } = req.body;
    const admin = await Admin.findById(id).populate("role");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }
    if (admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Cannot modify Super Admin." });
    }
    if (name !== undefined) admin.name = name.trim();
    if (email !== undefined) admin.email = email.trim().toLowerCase();
    if (roleId !== undefined) {
      const role = await Role.findById(roleId);
      if (!role) return res.status(400).json({ success: false, message: "Invalid role." });
      admin.role = roleId;
    }
    if (status !== undefined) admin.status = status;
    if (approvalStatus !== undefined) admin.approvalStatus = approvalStatus;
    await admin.save();
    await admin.populate("role", "name permissions");
    await createAuditLog(req.admin._id, req.admin.email, "update_admin", "admins", { adminId: admin._id }, req);
    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
          approvalStatus: admin.approvalStatus,
          updatedAt: admin.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }
    if (admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Cannot delete Super Admin." });
    }
    await Admin.findByIdAndDelete(id);
    await createAuditLog(req.admin._id, req.admin.email, "delete_admin", "admins", { adminId: id, email: admin.email }, req);
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    const admin = await Admin.findById(id).populate("role");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }
    if (admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Cannot change Super Admin status." });
    }
    admin.status = status;
    await admin.save();
    await createAuditLog(req.admin._id, req.admin.email, "update_admin_status", "admins", { adminId: id, status }, req);
    res.json({
      success: true,
      data: { admin: { id: admin._id, status: admin.status } },
    });
  } catch (err) {
    next(err);
  }
}

export async function approveOrRejectAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "action must be 'approve' or 'reject'." });
    }
    const admin = await Admin.findById(id).populate("role");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }
    if (admin.isSuperAdmin) {
      return res.status(403).json({ success: false, message: "Cannot change Super Admin approval." });
    }
    admin.approvalStatus = action === "approve" ? "approved" : "rejected";
    if (action === "approve") admin.status = "active";
    await admin.save();
    await createAuditLog(req.admin._id, req.admin.email, `admin_${action}`, "admins", { adminId: id }, req);
    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          approvalStatus: admin.approvalStatus,
          status: admin.status,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
