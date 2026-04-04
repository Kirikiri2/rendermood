import prisma from "../utils/prisma.js";
import { sendLeadToBitrix } from "../services/bitrix.service.js";

export const createSubmission = async (req, res) => {
  try {
    const { name, phone, email, comment, consent, answers } = req.body;

    // 1. создаём запись в БД
    const submission = await prisma.submission.create({
      data: {
        name,
        phone,
        email,
        comment,
        consent,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            optionId: a.optionId || null,
            value: a.value || null,
            numberValue: a.numberValue || null,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    // 2. отправляем в Bitrix
    const bitrix = await sendLeadToBitrix(submission);

    return res.json({
      success: true,
      submission,
      bitrix,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Submission failed",
    });
  }
};