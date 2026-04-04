import axios from "axios";

const BITRIX_URL =
  "https://b24-1x23x3.bitrix24.ru/rest/1/ebf2lfzhwuqftfmj/crm.lead.add.json";

export const sendLeadToBitrix = async (submission) => {
  const answersText = submission.answers
    .map((a) => {
      return `Q${a.questionId}: ${
        a.value || a.numberValue || (a.optionId ? `option ${a.optionId}` : "")
      }`;
    })
    .join("\n");

  const payload = {
    fields: {
      TITLE: `Заявка с сайта`,
      
      NAME: submission.name?.split(" ")[0] || "",
      LAST_NAME: submission.name?.split(" ").slice(1).join(" ") || "",

      PHONE: [
        {
          VALUE: submission.phone,
          VALUE_TYPE: "WORK",
        },
      ],

      EMAIL: [
        {
          VALUE: submission.email,
          VALUE_TYPE: "WORK",
        },
      ],

      COMMENTS: `
Комментарий:
${submission.comment || ""}

Ответы:
${answersText}
      `.trim(),
    },
  };

  const { data } = await axios.post(BITRIX_URL, payload);

  return data;
};