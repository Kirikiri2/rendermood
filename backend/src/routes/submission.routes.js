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
 *               summary: All questions answered (valid request)
 *               description: User answered all required questions successfully
*               value:
*                 name: Замени на набор букв
*                 phone: "+79991234567"
*                 email: "ЗамениНаНаборБуквИЦифр@mail.com"
*                 answers:
*                   - questionId: 1
*                     optionId: 2
*                   - questionId: 2
*                     value: "65"
*                   - questionId: 3
*                     optionId: 4
*                   - questionId: 4
*                     optionId: 1
*                   - questionId: 5
*                     optionId: 3
*                   - questionId: 6
*                     value: "@tany_design"

 *             partialSubmission:
 *               summary: Missing answers (invalid request)
 *               description: User did not answer all required questions
 *               value:
 *                 name: Anna
 *                 phone: "+79991234567"
 *                 email: "anna2@mail.com"
 *                 answers:
 *                   - questionId: 1
 *                     optionId: 2

 *             duplicateEmailSubmission:
 *               summary: Duplicate email (business rule violation)
 *               description: This email already exists in the system
 *               value:
 *                 name: Tany
 *                 phone: "+79991234567"
 *                 email: "fgj87687fs9udi@mail.com"
 *                 answers:
 *                   - questionId: 1
 *                     optionId: 2
 *                   - questionId: 2
 *                     value: "Some answer"
 *                   - questionId: 3
 *                     optionId: 5
 *     responses:
 *       201:
 *         description: Submission created
 *       400:
 *         description: Validation error (missing answers)
 *       409:
 *         description: Duplicate email
 */
router.post("/", SubmissionController.create);

export default router;