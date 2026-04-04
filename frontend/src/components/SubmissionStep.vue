<script setup lang="ts">
import { ref } from 'vue'
import { useQuizStore } from '@/stores/quizStore'

const store = useQuizStore()

// Поля формы
const name = ref('')
const phone = ref('')
const email = ref('')
const notes = ref('')

// Сообщения об ошибках/успехе
const errorMessage = ref('')
const successMessage = ref('')

// Отправка формы
const submit = async () => {
  try {
    // Проверка обязательных полей
    if (!phone.value) {
      errorMessage.value = 'Телефон обязателен для отправки'
      return
    }

    const response = await fetch('http://localhost:3000/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        phone: phone.value,
        email: email.value,
        notes: notes.value,
        answers: store.answers,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text)
    }

    successMessage.value = 'Заявка успешно отправлена!'
    errorMessage.value = ''
  } catch (err: unknown) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'Произошла неизвестная ошибка'
    }
    successMessage.value = ''
  }
}
</script>

<template>
  <div>
    <h2>Введите ваши контакты</h2>

    <div style="margin-bottom: 10px">
      <label>Имя:</label>
      <input v-model="name" type="text" placeholder="Ваше имя" />
    </div>

    <div style="margin-bottom: 10px">
      <label>Телефон*:</label>
      <input v-model="phone" type="text" placeholder="+7 999 999-99-99" />
    </div>

    <div style="margin-bottom: 10px">
      <label>Email:</label>
      <input v-model="email" type="email" placeholder="example@mail.com" />
    </div>

    <div style="margin-bottom: 10px">
      <label>Особые пожелания:</label>
      <textarea v-model="notes" placeholder="Что-то особенное..."></textarea>
    </div>

    <button @click="submit">Отправить</button>

    <div v-if="errorMessage" style="color: red; margin-top: 10px">{{ errorMessage }}</div>
    <div v-if="successMessage" style="color: green; margin-top: 10px">{{ successMessage }}</div>
  </div>
</template>