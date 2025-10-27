// backend/routes/healthRoutes.js
import express from "express";
const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
