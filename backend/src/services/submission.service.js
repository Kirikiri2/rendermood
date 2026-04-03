import { prisma } from "../utils/prisma.js";

export const SubmissionService = {
  create: async (data) => {
    const { name, phone, email, answers } = data;

    // 1. получаем все вопросы
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
      throw new Error(
        `Not all questions answered. Missing: ${missing.join(", ")}`
      );
    }

    // 4. проверка на лишние ответы (очень важно)
    const extra = answeredIds.filter(
      id => !questionIds.includes(id)
    );

    if (extra.length > 0) {
      throw new Error(
        `Invalid questionIds: ${extra.join(", ")}`
      );
    }
    const existing = await prisma.submission.findFirst({
    where: {
        OR: [
            { email },
            { phone }
            ]
        }
    });

    if (existing) {
        throw new Error("You already submitted this form");
    }

    // 5. создаём submission
    return prisma.submission.create({
      data: {
        name,
        phone,
        email,
        answers: {
          create: answers.map(a => ({
            questionId: a.questionId,
            optionId: a.optionId || null,
            value: a.value || null
          }))
        }
      },
      include: {
        answers: true
      }
    });
  }
};