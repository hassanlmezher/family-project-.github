import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

import authRoutes from "./routes/authRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import listRoutes from "./routes/listRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { ensureInviteAndNotificationTables } from "./setup.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.json({ ok: true, name: "Family Shopping Planner API" }));

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/family", familyRoutes);
app.use("/invites", inviteRoutes);
app.use("/lists", listRoutes);
app.use("/notifications", notificationRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled", err);
  res.status(500).json({ error: "Server error" });
});

// ✅ Correct startup
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    console.log("🔹 Ensuring tables...");
    await ensureInviteAndNotificationTables();
    app.listen(PORT, () => console.log(`✅ API ready on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();
