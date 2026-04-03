import { SubmissionService } from "../services/submission.service.js";
import { AppError } from "../errors/AppError.js";

export const SubmissionController = {
  create: async (req, res) => {
    try {
      const result = await SubmissionService.create(req.body);

      return res.status(201).json(result);
    } catch (e) {
      if (e instanceof AppError) {
        return res.status(e.statusCode).json({
          error: true,
          message: e.message,
          code: e.code,
          details: e.details
        });
      }

      console.error("Unexpected error:", e);

      return res.status(500).json({
        error: true,
        message: "Internal server error",
        code: "INTERNAL_ERROR"
      });
    }
  }
};