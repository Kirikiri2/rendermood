import express from "express";
import { SubmissionController } from "../controllers/submission.controller.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const result = await SubmissionController.create(req, res);
    return result;
  } catch (err) {
    next(err);
  }
});

export default router;