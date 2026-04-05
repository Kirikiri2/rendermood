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

// Разрешаем CORS только для твоего фронтенда
app.use(cors({
  origin: ["https://rendermood.vercel.app"]
}));

// Helmet без Cross-Origin-Resource-Policy
app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(express.json());

// Папка для загрузок
const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Статика с правильными заголовками
app.use("/uploads", express.static(uploadsDir, {
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // для картинок
    res.setHeader("Access-Control-Allow-Origin", "*"); // для CORS
  }
}));

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Роуты
app.use("/api/steps", stepRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/options", optionRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;