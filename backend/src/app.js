import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import path from "path";

import { swaggerSpec } from "./config/swagger.js";

import stepRoutes from "./routes/step.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import optionRoutes from "./routes/option.routes.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(express.json());

/* =========================
   STATIC FILES (uploads)
========================= */
app.use("/uploads", express.static(path.resolve("uploads")));

/* =========================
   SWAGGER
========================= */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =========================
   ROUTES
========================= */
app.use("/api/steps", stepRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/options", optionRoutes);

/* =========================
   HEALTHCHECK
========================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;