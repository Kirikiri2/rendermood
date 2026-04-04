import { prisma } from "../utils/prisma.js";
import { BitrixService } from "./bitrix.service.js";

export const SubmissionService = {
  create: async (data) => {
    const { name, phone, email, comment, consent, answers } = data;

    // 0. обязательные поля (под твою схему)
    if (!email || !phone || !name) {
      throw new Error("Name, phone, email are required");
    }

    if (!consent) {
      throw new Error("Consent must be accepted");
    }

    // 1. получаем вопросы
    const questions = await prisma.question.findMany({
      include: { options: true }
    });

    const questionIds = questions.map(q => q.id);

    // 2. пришедшие ответы
    const answeredIds = answers.map(a => a.questionId);

    // 3. проверка пропусков
    const missing = questionIds.filter(id => !answeredIds.includes(id));

    if (missing.length > 0) {
      throw new Error(`Missing answers for questions: ${missing.join(", ")}`);
    }

    // 4. проверка лишних
    const extra = answeredIds.filter(id => !questionIds.includes(id));

    if (extra.length > 0) {
      throw new Error(`Invalid questionIds: ${extra.join(", ")}`);
    }

    // 5. дубликат (лучше email + phone)
    const existing = await prisma.submission.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existing) {
      throw new Error("You already submitted this form");
    }

    // 6. сохраняем submission
    const submission = await prisma.submission.create({
      data: {
        name,
        phone,
        email,
        comment,
        consent,
        answers: {
          create: answers.map(a => ({
            questionId: a.questionId,
            optionId: a.optionId || null,
            value: a.value || null,
            numberValue: a.numberValue ?? null
          }))
        }
      },
      include: {
        answers: true
      }
    });

    // 7. отправка в Bitrix (не ломает флоу)
    await BitrixService.createLead({
      name,
      phone,
      email,
      comment,
      answers
    });

    return submission;
  }
};