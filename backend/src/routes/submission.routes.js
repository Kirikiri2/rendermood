import express from "express";
import { SubmissionController } from "../controllers/submission.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           examples:
 *             completeSubmission:
 *               summary: Valid submission
 *               value:
 *                 name: "Test User"
 *                 phone: "+79991234567"
 *                 email: "test@mail.com"
 *                 answers:
 *                   - questionId: 1
 *                     optionId: 2
 *                   - questionId: 2
 *                     value: "65"
 *
 *             partialSubmission:
 *               summary: Missing answers
 *               value:
 *                 name: "Anna"
 *                 phone: "+79991234567"
 *                 email: "anna@mail.com"
 *                 answers:
 *                   - questionId: 1
 *                     optionId: 2
 *
 *     responses:
 *       201:
 *         description: Submission created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate email
 */
router.post("/", SubmissionController.create);

export default router;