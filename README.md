# 🚀 Quiz / Form Builder Project

Интерактивное веб-приложение для создания и прохождения квиз-форм с сохранением ответов, аналитикой и интеграцией с внешними сервисами.

---

## 🌐 Демо

👉 Открыть проект: [https://rendermood.vercel.app](https://rendermood.vercel.app)

---

## 📌 Описание

Этот проект представляет собой систему для создания и прохождения квиз-формы с динамическими шагами и разными типами вопросов.

Пользователь проходит форму шаг за шагом, а результаты отправляются на сервер и могут использоваться для аналитики или интеграций (например, Bitrix24, Яндекс Метрика).

---

## ⚙️ Основной функционал

- 🧩 Многошаговые формы (step-by-step quiz)
- 📊 Разные типы вопросов:
  - radio
  - checkbox
  - input
  - slider
  - carousel
- 💾 Сохранение состояния (localStorage)
- 📡 Отправка данных на backend API
- 🔗 Интеграция с Bitrix24
- 📈 Аналитика через Яндекс Метрику
- 🧠 Валидация и обработка ответов
- 🛠 Админ-логика (управление шагами и вопросами)

---

## 🧱 Стек технологий

**Frontend:**

- Vue 3
- Pinia
- TypeScript
- Vite

**Backend:**

- Node.js
- Express
- Prisma
- PostgreSQL

**Деплой:**

- Frontend: Vercel
- Backend: Render
- Database: Neon

---

## 📦 API

Пример запроса отправки результата:

```http
POST /api/submissions
GET /api/steps
```

## Запуск проекта

Frontend

```
npm install
npm run dev
```

Backend

```
npm install
npm run dev
```
