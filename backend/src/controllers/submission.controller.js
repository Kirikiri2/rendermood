import { SubmissionService } from "../services/submission.service.js";

export const SubmissionController = {
  create: async (req, res) => {
    try {
      const submission = await SubmissionService.create(req.body);

      return res.json({
        success: true,
        submission
      });

    } catch (error) {
      console.error(error);

      return res.status(error.status || 500).json({
        success: false,
        error: error.message || "Submission failed"
      });
    }
  }
};