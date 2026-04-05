import { prisma } from "../utils/prisma.js";
import { sendLeadToBitrix } from "./bitrix.service.js";

export const SubmissionService = {
  create: async (data) => {
    const { name, phone, email, comment, consent, answers } = data;

    // 1. VALIDATION
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

    // 2. DUPLICATE CHECK
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

    // 3. GET QUESTIONS
    const questions = await prisma.question.findMany({
      include: { options: true }
    });

    const questionMap = new Map();
    questions.forEach(q => questionMap.set(q.id, q));

    // 4. VALIDATION (НОВАЯ ЛОГИКА ПОД JSON)
    for (const a of answers) {
      const question = questionMap.get(Number(a.questionId));
      if (!question) continue;

      const value = a.value;

      // required check
      if (question.isRequired) {
        const hasValue =
          value !== undefined &&
          value !== null &&
          value !== "";

        if (!hasValue) {
          const err = new Error(`Question ${question.id} is required`);
          err.status = 400;
          throw err;
        }
      }

      // type validation (мягкая, без numberValue)
      if (question.type === "radio" || question.type === "carousel") {
        if (!a.optionId) {
          throw new Error(`Question ${question.id} requires optionId`);
        }
      }

      if (question.type === "checkbox") {
        if (!a.optionId) {
          throw new Error(`Checkbox question ${question.id} requires optionId`);
        }
      }

      if (question.type === "input") {
        if (!value) {
          throw new Error(`Question ${question.id} requires text value`);
        }
      }

      if (question.type === "slider") {
        if (value === undefined || value === null || value === "") {
          throw new Error(`Question ${question.id} requires value`);
        }
      }
    }

    // 5. SAVE
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

            optionId:
              a.optionId !== undefined && a.optionId !== null
                ? Number(a.optionId)
                : null,

            value: a.value ?? null
          }))
        }
      },
      include: {
        answers: true
      }
    });

    // 6. BITRIX SAFE CALL
    try {
      await sendLeadToBitrix.createLead({
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