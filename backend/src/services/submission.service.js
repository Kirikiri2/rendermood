import { prisma } from "../utils/prisma.js";
import { BitrixService } from "./bitrix.service.js";

export const SubmissionService = {
  create: async (data) => {
    const { name, phone, email, comment, consent, answers } = data;

    // 1. базовая валидация
    if (!name || !phone || !email) {
      const err = new Error("Name, phone, email are required");
      err.status = 400;
      throw err;
    }

    if (!consent) {
      const err = new Error("Consent must be accepted");
      err.status = 400;
      throw err;
    }

    if (!Array.isArray(answers)) {
      const err = new Error("Answers must be an array");
      err.status = 400;
      throw err;
    }

    // 2. получаем вопросы из БД
    const questions = await prisma.question.findMany({
      include: { options: true }
    });

    const questionIds = questions.map(q => Number(q.id));
    const answeredIds = answers.map(a => Number(a.questionId));

    // 3. проверка лишних ответов (мягкая, не критическая)
    const extra = answeredIds.filter(id => !questionIds.includes(id));
    if (extra.length > 0) {
      console.warn("⚠️ Extra questionIds ignored:", extra);
    }

    // 4. проверка дублей
    const existing = await prisma.submission.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existing) {
      const err = new Error("You already submitted this form");
      err.status = 409;
      throw err;
    }

    // 5. сохранение submission
    const submission = await prisma.submission.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        comment: comment?.trim() || "",
        consent: Boolean(consent),

        answers: {
          create: answers.map(a => ({
            questionId: Number(a.questionId),
            optionId: a.optionId ?? null,
            value: a.value ?? null,
            numberValue: a.numberValue ?? null
          }))
        }
      },
      include: {
        answers: true
      }
    });

    // 6. Bitrix (НЕ ЛОМАЕТ API)
    try {
      await BitrixService.createLead({
        name,
        phone,
        email,
        comment,
        answers
      });
    } catch (e) {
      console.error("⚠️ Bitrix error:", e.message);
    }

    return submission;
  }
};