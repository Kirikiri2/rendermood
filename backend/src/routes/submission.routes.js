import express from "express";
import { SubmissionController } from "../controllers/submission.controller.js";

const router = express.Router();

router.post("/", SubmissionController.create);

export default router;