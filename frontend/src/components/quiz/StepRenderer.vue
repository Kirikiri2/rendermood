<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

import RadioQuestion from '@/components/questions/RadioQuestion.vue'
import CheckboxQuestion from '@/components/questions/CheckboxQuestion.vue'
import InputQuestion from '@/components/questions/InputQuestion.vue'
import RangeQuestion from '@/components/questions/RangeQuestion.vue'
import SubmissionStep from '../SubmissionStep.vue'
import { stepConfig } from '@/config/stepConfig'
import { useQuizStore } from '@/stores/quizStore'

const store = useQuizStore()
const step = computed(() => store.currentStepData)

// ✅ Компонент выбираем по step.id из stepConfig
const QuestionComponent = computed((): Component | null => {
  if (!step.value?.question) return null

  const config = stepConfig[step.value.id]

  // 1. Приоритет: явный компонент из конфига
  if (config?.component) {
    const map: Record<string, Component> = {
      radio: RadioQuestion,
      checkbox: CheckboxQuestion,
      input: InputQuestion,
      range: RangeQuestion,
    }
    return map[config.component] || null
  }

  // 2. Фоллбэк: по типу вопроса (с нормализацией slider→range)
  const type = step.value.question.type === 'slider' ? 'range' : step.value.question.type
  const map: Record<string, Component> = {
    radio: RadioQuestion,
    checkbox: CheckboxQuestion,
    input: InputQuestion,
    range: RangeQuestion,
  }
  return map[type] || null
})

// ✅ Конфиг для текущего шага
const currentConfig = computed(() => {
  return step.value ? (stepConfig[step.value.id] ?? {}) : {}
})

// ✅ Показывать поле "Свой вариант" (но не для range)
const showCustomInput = computed(() => {
  return (
    currentConfig.value.showCustom !== false &&
    step.value?.question?.type !== 'range' &&
    step.value?.question?.type !== 'slider'
  )
})

// ✅ Показывать поле "Другое" (только для шага 1)
const showOtherInput = computed(() => {
  return currentConfig.value.showOther === true
})

// ✅ Обработчик для поля "Свой вариант"
const onCustomInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const questionId = step.value?.question?.id
  if (questionId !== undefined) {
    store.setCustomInput(questionId, target.value)
  }
}

// ✅ Валидация текущего шага
const isStepValid = computed(() => {
  if (!step.value) return false
  if (step.value.type === 'form') {
    return !!(store.form.name?.trim() && store.form.phone?.trim() && store.form.agree)
  }

  const question = step.value.question
  if (!question) return false
  if (question.type === 'range') return true // ползунок всегда валиден

  const answer = store.answers[question.id]
  if (!answer) return false

  switch (question.type) {
    case 'radio':
      return typeof answer.selected === 'number'

    case 'checkbox': {
      const sel = answer.selected
      // Без логов! Проверяем строго
      if (Array.isArray(sel)) return sel.length > 0
      if (typeof sel === 'number') return true
      return false
    }

    case 'input':
      return !!answer.custom?.trim()

    default:
      return false
  }
})
</script>

<template>
  <div v-if="step">
    <h2>{{ step.title }}</h2>

    <!-- Рендер вопроса -->
    <component
      v-if="step.type === 'question' && step.question && QuestionComponent"
      :is="QuestionComponent"
      :question="step.question"
      :answer="store.answers[step.question.id]"
      v-bind="currentConfig"
    />

    <!-- Поле "Свой вариант" (если нужно) -->
    <input
      v-if="showCustomInput && step.question"
      :placeholder="'Свой вариант'"
      :value="store.answers[step.question.id]?.custom || ''"
      @input="onCustomInput"
      class="custom-input"
    />

    <!-- Поле "Другое" (заглушка, если нужно) -->
    <div v-if="showOtherInput" class="other-placeholder"></div>

    <!-- Форма отправки -->
    <SubmissionStep v-if="step.type === 'form'" />

    <!-- Навигация -->
    <div style="margin-top: 20px; display: flex; gap: 12px">
      <button @click="store.prevStep" :disabled="store.currentStep === 0">Назад</button>
      <button
        @click="store.nextStep"
        :disabled="!isStepValid || store.currentStep >= store.steps.length - 1"
      >
        Вперед
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-input {
  margin-top: 16px;
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}
.custom-input:focus {
  border-color: #3b82f6;
  outline: none;
}
.other-placeholder {
  margin-top: 8px;
}
</style>
