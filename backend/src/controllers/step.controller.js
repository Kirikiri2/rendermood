import { StepService } from "../services/step.service.js";
import { AppError } from "../errors/AppError.js";

export const StepController = {
  getAll: async (req, res) => {
    try {
      const steps = await StepService.getAll();

      return res.json(steps);
    } catch (e) {
      console.error("StepService error:", e);

      if (e instanceof AppError) {
        return res.status(e.statusCode).json({
          error: true,
          message: e.message,
          code: e.code
        });
      }

      return res.status(500).json({
        error: true,
        message: "Failed to load steps",
        code: "STEPS_LOAD_FAILED"
      });
    }
  }
};