// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ensureInviteAndNotificationTables } from "./setup.js";

// Routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import listRoutes from "./routes/listRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Load environment file
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Family Shopping Planner API running" });
});

// Routers
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/family", familyRoutes);
app.use("/invites", inviteRoutes);
app.use("/lists", listRoutes);
app.use("/notifications", notificationRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    console.log("⏳ Setting up database tables if needed...");
    await ensureInviteAndNotificationTables();

    // 👇 Bind to 0.0.0.0 so GitHub Actions runner can reach it
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();
