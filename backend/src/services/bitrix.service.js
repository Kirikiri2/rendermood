import axios from "axios";
import { prisma } from "../utils/prisma.js";

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK;

export const BitrixService = {
  createLead: async ({ name, phone, email, answers }) => {
    try {
      // 1. получаем все вопросы + опции
      const questions = await prisma.question.findMany({
        include: {
          options: true
        }
      });

      // 2. превращаем в удобный map
      const questionMap = new Map();
      questions.forEach(q => {
        questionMap.set(q.id, q);
      });

      // 3. формируем ответы
      const formattedAnswers = answers.map(a => {
        const question = questionMap.get(a.questionId);

        if (!question) return null;

        let answerText = "";

        // если выбрана опция
        if (a.optionId) {
          const option = question.options.find(
            o => o.id === a.optionId
          );
          answerText = option ? option.text : "Не найдено";
        } 
        // если ввод вручную
        else if (a.value) {
          answerText = a.value;
        }

        return `${question.text}: ${answerText}`;
      }).filter(Boolean);

      // 4. дата заявки
      const createdAt = new Date().toLocaleString("ru-RU");

      // 5. финальный комментарий
      const comments = `
📅 Дата заявки: ${createdAt}

👤 Клиент:
Имя: ${name}
Телефон: ${phone}
Email: ${email || "-"}

📋 Ответы:
${formattedAnswers.join("\n")}
      `;

      // 6. отправка в Bitrix
      const response = await axios.post(
        `${BITRIX_WEBHOOK}crm.lead.add.json`,
        {
          FIELDS: {
            TITLE: "Квиз: заявка на дизайн",
            NAME: name,
            PHONE: [
              { VALUE: phone, VALUE_TYPE: "WORK" }
            ],
            EMAIL: email
              ? [{ VALUE: email, VALUE_TYPE: "WORK" }]
              : [],
            COMMENTS: comments
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error(
        "Bitrix error:",
        error.response?.data || error.message
      );

      return null;
    }
  }
};