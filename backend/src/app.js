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

app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(express.json());

const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


app.use("/uploads", express.static(uploadsDir));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/steps", stepRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/options", optionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;