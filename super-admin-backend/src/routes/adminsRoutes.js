import { Router } from "express";
import { authMiddleware, requireSuperAdmin } from "../middleware/auth.js";
import * as ctrl from "../controllers/adminsController.js";

const router = Router();
router.use(authMiddleware);
router.use(requireSuperAdmin);

router.get("/", ctrl.listAdmins);
router.post("/", ctrl.createAdmin);
router.put("/:id", ctrl.updateAdmin);
router.delete("/:id", ctrl.deleteAdmin);
router.put("/:id/status", ctrl.updateAdminStatus);
router.put("/:id/approve", ctrl.approveOrRejectAdmin);

export default router;
