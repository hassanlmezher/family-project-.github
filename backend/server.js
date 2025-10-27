import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load the correct environment file
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

// Routes
import authRoutes from "./routes/authRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import listRoutes from "./routes/listRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

// DB setup helper
import { ensureInviteAndNotificationTables } from "./setup.js";

const app = express();

app.use(cors());
app.use(express.json());

// Base route
app.get("/", (_, res) =>
  res.json({ ok: true, name: "Family Shopping Planner API" })
);

// Health check (used in CI)
app.use("/health", healthRoutes);

// Core routes
app.use("/auth", authRoutes);
app.use("/family", familyRoutes);
app.use("/invites", inviteRoutes);
app.use("/lists", listRoutes);
app.use("/notifications", notificationRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled", err);
  res.status(500).json({ error: "Server error" });
});

// ✅ Start the server only after DB setup is ready
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    console.log("Setting up database tables...");
    await ensureInviteAndNotificationTables();

    app.listen(PORT, () => {
      console.log(`✅ API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
