import { Router } from "express";
import { authMiddleware, requireSuperAdmin } from "../middleware/auth.js";
import * as ctrl from "../controllers/auditLogsController.js";

const router = Router();
router.use(authMiddleware);
router.use(requireSuperAdmin);

router.get("/", ctrl.listAuditLogs);

export default router;
