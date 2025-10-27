// backend/routes/healthRoutes.js
import express from "express";
const router = express.Router();

// Keep CI health check simple: just report server is alive.
router.get("/", (_req, res) => {
  res.status(200).json({ ok: true });
});

export default router;
