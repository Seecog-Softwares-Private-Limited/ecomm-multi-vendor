import { AuditLog } from "../models/AuditLog.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function listAuditLogs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
    const adminId = req.query.adminId;
    const module = req.query.module;
    const action = req.query.action;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const filter = {};
    if (adminId) filter.adminId = adminId;
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate("adminId", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    const items = logs.map((l) => ({
      id: l._id,
      adminId: l.adminId?._id || l.adminId,
      adminName: l.adminId?.name,
      adminEmail: l.adminEmail || l.adminId?.email,
      action: l.action,
      module: l.module,
      metadata: l.metadata,
      createdAt: l.createdAt,
      ip: l.ip,
    }));

    res.json({
      success: true,
      data: {
        logs: items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
}
