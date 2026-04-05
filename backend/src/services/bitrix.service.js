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

    // Формируем полный комментарий со всеми данными
    const fullComment = `
📅 Дата заявки: ${createdAt}

👤 Клиент:
Имя: ${name}
Телефон: ${phone}
Email: ${email || "-"}
Комментарий: ${comment || "-"}

📝 Ответы на вопросы:
${formattedAnswers.join("\n")}
    `;

    // Подготавливаем данные для Bitrix
    const leadData = {
      FIELDS: {
        TITLE: `Квиз: заявка от ${name}`,
        NAME: name,
        PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }],
        EMAIL: email ? [{ VALUE: email, VALUE_TYPE: "WORK" }] : [],
        COMMENTS: fullComment, // Все данные в комментарий
        SOURCE_ID: "WEB", // Источник - сайт
        SOURCE_DESCRIPTION: "Квиз на сайте rendermood.vercel.app"
      },
      params: { REGISTER_SONET_EVENT: "Y" } // Отправить уведомление
    };

    console.log("🚀 Sending to Bitrix:", JSON.stringify(leadData, null, 2));

    const response = await axios.post(
      `${BITRIX_WEBHOOK}crm.lead.add.json`,
      leadData
    );

    console.log("✅ Bitrix response:", response.data);

    if (response.data.error) {
      console.error("❌ Bitrix error:", response.data.error_description);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("❌ Bitrix error:", error.response?.data || error.message);
    return null;
  }
};