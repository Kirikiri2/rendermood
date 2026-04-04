import axios from "axios";
import { prisma } from "../utils/prisma.js";

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK;

export const sendLeadToBitrix = async ({ name, phone, email, comment, answers }) => {
  try {
    const questions = await prisma.question.findMany({
      include: { options: true }
    });

    const questionMap = new Map();
    questions.forEach(q => questionMap.set(q.id, q));

    const formattedAnswers = answers
      .map(a => {
        const question = questionMap.get(a.questionId);
        if (!question) return null;

        let answerText = "";

        if (a.optionId) {
          const option = question.options.find(o => o.id === a.optionId);
          answerText = option?.text || "Не найдено";
        } else if (a.numberValue !== null && a.numberValue !== undefined) {
          answerText = String(a.numberValue);
        } else if (a.value) {
          answerText = a.value;
        }

        return `• ${question.text}: ${answerText}`;
      })
      .filter(Boolean);

    const createdAt = new Date().toLocaleString("ru-RU");

    const comments = `
📅 Дата заявки: ${createdAt}

👤 Клиент:
Имя: ${name}
Телефон: ${phone}
Email: ${email}
Комментарий: ${comment || "-"}

📋 Ответы:
${formattedAnswers.join("\n")}
    `;

    const response = await axios.post(
      `${BITRIX_WEBHOOK}crm.lead.add.json`,
      {
        FIELDS: {
          TITLE: "Квиз: заявка на дизайн",
          NAME: name,
          PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }],
          EMAIL: email ? [{ VALUE: email, VALUE_TYPE: "WORK" }] : [],
          COMMENTS: comments
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Bitrix error:", error.response?.data || error.message);
    return null;
  }
};