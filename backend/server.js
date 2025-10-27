// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

// routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import listRoutes from "./routes/listRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// setup
import { ensureInviteAndNotificationTables } from "./setup.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, name: "Family Shopping Planner API" }));
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/family", familyRoutes);
app.use("/invites", inviteRoutes);
app.use("/lists", listRoutes);
app.use("/notifications", notificationRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    console.log("⏳ Ensuring DB tables...");
    await ensureInviteAndNotificationTables(); // safe to await here
    // 👇 bind to 0.0.0.0 so the runner can hit it
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ API ready on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();
