// 5. SAVE - ИСПРАВЛЕННАЯ ВЕРСИЯ (замени весь блок сохранения)
const submission = await prisma.submission.create({
  data: {
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    comment: comment?.trim() || "",
    consent: Boolean(consent),

    answers: {
      create: answers
        .filter(a => a.questionId && !isNaN(Number(a.questionId))) // Отфильтровываем NaN
        .map(a => ({
          question: {                    // 👈 ВАЖНО: добавляем связь
            connect: { id: Number(a.questionId) }
          },
          optionId: a.optionId !== undefined && a.optionId !== null
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