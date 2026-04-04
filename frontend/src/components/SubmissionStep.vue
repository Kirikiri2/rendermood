<!-- components/SubmissionStep.vue -->
<script setup lang="ts">
import { useQuizStore } from '@/stores/quizStore'

const store = useQuizStore()

// 🔒 Безопасная обработка текстовых полей
const handleInput = (e: Event, key: 'name' | 'phone' | 'email' | 'comment') => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  store.setFormField(key, target.value as string)
}

// 🔒 Безопасная обработка чекбокса
const handleCheckbox = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setFormField('agree', target.checked)
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Имя *</label>
      <input
        v-model="store.form.name"
        @input="handleInput($event, 'name')"
        type="text"
        class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        placeholder="Ваше имя"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Телефон *</label>
      <input
        v-model="store.form.phone"
        @input="handleInput($event, 'phone')"
        type="tel"
        class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        placeholder="+7 (___) ___-__-__"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Email</label>
      <input
        v-model="store.form.email"
        @input="handleInput($event, 'email')"
        type="email"
        class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        placeholder="email@example.com"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Комментарий</label>
      <textarea
        v-model="store.form.comment"
        @input="handleInput($event, 'comment')"
        class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        rows="3"
        placeholder="Дополнительная информация"
      />
    </div>

    <label class="flex items-center gap-2 cursor-pointer">
      <input
        v-model="store.form.agree"
        @change="handleCheckbox($event)"
        type="checkbox"
        class="w-4 h-4 accent-blue-600"
      />
      <span class="text-sm">
        Согласен на обработку <a href="/privacy" class="text-blue-600 hover:underline">персональных данных</a> *
      </span>
    </label>
  </div>
</template>