import { prisma } from "../utils/prisma.js";
import { sendLeadToBitrix } from "../services/bitrix.service.js";

export const SubmissionController = {
  create: async (req, res) => {
    try {
      const { name, phone, email, comment, consent, answers } = req.body;

const safeAnswers = Array.isArray(answers) ? answers : [];

      // 0. ❗ CHECK DUPLICATE USER (ADDED)
      const existing = await prisma.submission.findFirst({
        where: {
          OR: [
            { email },
            { phone }
          ]
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: "User already submitted this form"
        });
      }

      // 1. save to DB
      const submission = await prisma.submission.create({
        data: {
          name,
          phone,
          email,
          comment,
          consent,
          answers: {
  create: safeAnswers.map(a => ({
    questionId: a.questionId,
    optionId: a.optionId || null,
    value: a.value || null,
    numberValue: a.numberValue || null
  }))
}
        },
        include: {
          answers: true
        }
      });

      // 2. send to Bitrix
      const bitrix = await sendLeadToBitrix(submission);

      return res.json({
        success: true,
        submission,
        bitrix
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error: "Submission failed"
      });
    }
  }
};