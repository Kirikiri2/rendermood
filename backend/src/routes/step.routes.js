import express from "express";
import { StepController } from "../controllers/step.controller.js";

const router = express.Router();
/**
 * @swagger
 * /api/steps:
 *   get:
 *     summary: Get all quiz steps
 *     tags: [Steps]
 *     responses:
 *       200:
 *         description: List of steps
 */
router.get("/", StepController.getAll);

export default router;