<script setup lang="ts">
import type { Component } from 'vue'
import type { AnswerValue, Question } from '@/shared/quiz'

import RadioQuestion from '../questions/RadioQuestion.vue'
import CheckboxQuestion from '../questions/CheckboxQuestion.vue'
import InputQuestion from '../questions/InputQuestion.vue'
import RangeQuestion from '../questions/RangeQuestion.vue'

import { useQuizStore } from '@/stores/quizStore'
import { stepConfig } from '@/config/stepConfig'
import { computed } from 'vue'

const props = defineProps<{
  question: Question
  answer?: AnswerValue
}>()

const store = useQuizStore()

// Конфигурация текущего шага
const currentConfig = computed(() => stepConfig[props.question.stepId] ?? {})

// Какой компонент рендерить
const QuestionComponent = computed((): Component => {
  // Приоритет отдаём тому, что явно указано в stepConfig
  if (currentConfig.value.component === 'range') {
    return RangeQuestion
  }

  switch (props.question.type) {
    case 'radio':
      return RadioQuestion
    case 'checkbox':
      return CheckboxQuestion
    case 'input':
      return InputQuestion
    default:
      return InputQuestion // fallback
  }
})

// Показывать обычное поле "Свой вариант"
const showCustomInput = computed(() => {
  return currentConfig.value.showCustom !== false
})

// Показывать специальное поле "Другое" (только для шага 1)
const showOtherInput = computed(() => {
  return currentConfig.value.showOther === true
})

// Обработчик для обычного поля "Свой вариант"
const onCustomInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setCustomInput(props.question.id, target.value)
}
</script>

<template>
  <div>
    <!-- Основной компонент вопроса (Radio, Checkbox, Range и т.д.) -->
    <component
      :is="QuestionComponent"
      :question="question"
      :answer="answer"
      v-bind="currentConfig"
    />

    <!-- Обычное поле "Свой вариант" (для шага 2 и других) -->
    <input
      v-if="showCustomInput"
      placeholder="Свой вариант"
      :value="answer?.custom || ''"
      @input="onCustomInput"
      class="custom-input"
    />

    <!-- Специальное поле "Другое" — управляется внутри RadioQuestion, 
         здесь только оставляем место и флаг -->
    <div v-if="showOtherInput" class="other-placeholder"></div>
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
