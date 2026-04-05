import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";

import { swaggerSpec } from "./config/swagger.js";

import stepRoutes from "./routes/step.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import optionRoutes from "./routes/option.routes.js";

const app = express();

/**
 * 🔥 CORS (ВАЖНО: preflight + credentials-safe setup)
 */
app.use(cors({
  origin: [
    "https://rendermood.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


/**
 * 🔐 Helmet (без конфликтов с CORS)
 */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
  })
);

/**
 * 📦 JSON parser (должен быть ДО routes)
 */
app.use(express.json());

/**
 * 📁 uploads folder
 */
const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

/**
 * 🖼 static files
 */
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  })
);

/**
 * 📚 Swagger
 */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * 🚀 API routes
 */
app.use("/api/steps", stepRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/options", optionRoutes);

/**
 * ❤️ health check
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * ❌ 404 handler (ВАЖНО — иначе HTML отдаётся)
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/**
 * 💥 GLOBAL ERROR HANDLER (КРИТИЧНО)
 */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

export default app;