// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ensureInviteAndNotificationTables } from "./setup.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import listRoutes from "./routes/listRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (_, res) => res.json({ ok: true, message: "Family Shopping Planner API running" }));

// Subroutes
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/family", familyRoutes);
app.use("/invites", inviteRoutes);
app.use("/lists", listRoutes);
app.use("/notifications", notificationRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    console.log("🔄 Checking DB tables...");
    await ensureInviteAndNotificationTables();
    console.log("✅ DB ready. Starting server...");
  } catch (error) {
    console.error("❌ DB setup failed:", error);
    console.log("Starting server without DB setup...");
  }

  // ✅ Bind to 0.0.0.0 for CI to detect port 4000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 API running on http://0.0.0.0:${PORT}`);
  });
};

startServer();
