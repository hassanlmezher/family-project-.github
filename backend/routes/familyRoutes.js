// backend/routes/familyRoutes.js
import { Router } from "express";
import { requireAuth } from "../auth.js";
import { createFamily, getMyFamily, leaveFamily } from "../controllers/familyController.js";

const router = Router();

router.post("/create", requireAuth, createFamily);
router.get("/me", requireAuth, getMyFamily);
router.post("/leave", requireAuth, leaveFamily);

export default router;
