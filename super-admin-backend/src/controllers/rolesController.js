import { Role } from "../models/Role.js";
import { createAuditLog } from "../utils/audit.js";
import { ALL_PERMISSIONS } from "../constants/permissions.js";

export async function listRoles(req, res, next) {
  try {
    const roles = await Role.find().sort({ name: 1 }).lean();
    res.json({
      success: true,
      data: {
        roles: roles.map((r) => ({ id: r._id, name: r.name, permissions: r.permissions || [], description: r.description })),
        permissions: ALL_PERMISSIONS,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createRole(req, res, next) {
  try {
    const { name, permissions, description } = req.body;
    if (!name || !Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: "name and permissions (array) are required." });
    }
    const validPerms = permissions.filter((p) => ALL_PERMISSIONS.includes(p));
    const existing = await Role.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Role name already exists." });
    }
    const role = await Role.create({
      name: name.trim(),
      permissions: validPerms,
      description: description || "",
    });
    await createAuditLog(req.admin._id, req.admin.email, "create_role", "roles", { roleId: role._id, name: role.name }, req);
    res.status(201).json({
      success: true,
      data: {
        role: {
          id: role._id,
          name: role.name,
          permissions: role.permissions,
          description: role.description,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const { name, permissions, description } = req.body;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found." });
    }
    if (name !== undefined) role.name = name.trim();
    if (Array.isArray(permissions)) role.permissions = permissions.filter((p) => ALL_PERMISSIONS.includes(p));
    if (description !== undefined) role.description = description;
    await role.save();
    await createAuditLog(req.admin._id, req.admin.email, "update_role", "roles", { roleId: role._id }, req);
    res.json({
      success: true,
      data: {
        role: {
          id: role._id,
          name: role.name,
          permissions: role.permissions,
          description: role.description,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
