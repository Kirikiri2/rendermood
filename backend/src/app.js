import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import stepRoutes from "./routes/step.routes.js";
import submissionRoutes from "./routes/submission.routes.js";

const app = express();

app.use(cors({
  origin: "*", // можно ограничить позже
}));
app.use(helmet());
app.use(express.json());

// Swagger UI (SaaS style)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use("/api/steps", stepRoutes);
app.use("/api/submissions", submissionRoutes);

// healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;