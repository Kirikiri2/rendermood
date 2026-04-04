import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/AppError.js";

export const SubmissionService = {
  create: async (data) => {
    const { name, phone, email, consent, answers } = data;

    // 🔒 0. базовая проверка входных данных
    if (!name || !phone || !email) {
      throw new AppError(400, "MISSING_FIELDS", "Name, phone or email is missing");
    }

    if (!Array.isArray(answers)) {
      throw new AppError(400, "INVALID_ANSWERS", "Answers must be an array");
    }

    if (consent !== true) {
      throw new AppError(400, "CONSENT_REQUIRED", "Consent must be true");
    }

    // 1. получаем все вопросы из БД
    const questions = await prisma.question.findMany({
      select: { id: true }
    });

    const questionIds = questions.map(q => q.id);

    // 2. какие ответы пришли
    const answeredIds = answers.map(a => a.questionId);

    // 3. проверка на пропуски
    const missing = questionIds.filter(
      id => !answeredIds.includes(id)
    );

    if (missing.length > 0) {
      throw new AppError(
        400,
        "MISSING_ANSWERS",
        `Missing answers for questions: ${missing.join(", ")}`
      );
    }

    // 4. проверка на лишние ответы
    const extra = answeredIds.filter(
      id => !questionIds.includes(id)
    );

    if (extra.length > 0) {
      throw new AppError(
        400,
        "INVALID_QUESTION_IDS",
        `Invalid questionIds: ${extra.join(", ")}`
      );
    }

    // 5. защита от дублей
    const existing = await prisma.submission.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existing) {
      throw new AppError(
        409,
        "ALREADY_SUBMITTED",
        "You already submitted this form"
      );
    }

    // 6. создаём submission
    return prisma.submission.create({
      data: {
        name,
        phone,
        email,
        consent, // 🔥 ВАЖНО (теперь правильно)

        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            optionId: a.optionId ?? null,
            value: a.value ?? null
          }))
        }
      },
      include: {
        answers: true
      }
    });
  }
};