import { Router } from "express";
import { authMiddleware, requireSuperAdmin } from "../middleware/auth.js";
import * as ctrl from "../controllers/rolesController.js";

const router = Router();
router.use(authMiddleware);
router.use(requireSuperAdmin);

router.get("/", ctrl.listRoles);
router.post("/", ctrl.createRole);
router.put("/:id", ctrl.updateRole);

export default router;
