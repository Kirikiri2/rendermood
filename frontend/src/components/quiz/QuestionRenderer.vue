<script setup lang="ts">
import type { Component } from 'vue'
import type { AnswerValue, Question } from '@/shared/quiz'
import { computed } from 'vue'

import RadioQuestion from '../questions/RadioQuestion.vue'
import CheckboxQuestion from '../questions/CheckboxQuestion.vue'
import InputQuestion from '../questions/InputQuestion.vue'
import RangeQuestion from '../questions/RangeQuestion.vue'

import { useQuizStore } from '@/stores/quizStore'
import { stepConfig } from '@/config/stepConfig'

const props = defineProps<{
  question: Question
  answer?: AnswerValue
  stepId: number // ✅ Передаём step.id из родителя
}>()

const store = useQuizStore()

// ✅ Конфиг ищем по stepId (не по question.id!)
const currentConfig = computed(() => stepConfig[props.stepId] ?? {})

const QuestionComponent = computed((): Component => {
  // 1. Приоритет: явный компонент из config
  if (currentConfig.value.component) {
    const map: Record<string, Component> = {
      radio: RadioQuestion,
      checkbox: CheckboxQuestion,
      input: InputQuestion,
      range: RangeQuestion,
    }
    return map[currentConfig.value.component] || InputQuestion
  }
  
  // 2. Фоллбэк: по типу вопроса (с нормализацией slider→range)
  const type = props.question.type === 'slider' ? 'range' : props.question.type
  switch (type) {
    case 'radio': return RadioQuestion
    case 'checkbox': return CheckboxQuestion
    case 'input': return InputQuestion
    case 'range': return RangeQuestion
    default: return InputQuestion
  }
})

const showCustomInput = computed(() => {
  return currentConfig.value.showCustom !== false && 
         props.question.type !== 'range' // ✅ Не показывать для ползунка
})

const showOtherInput = computed(() => {
  return currentConfig.value.showOther === true
})

const onCustomInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setCustomInput(props.question.id, target.value)
}
</script>

<template>
  <div>
    <component
      :is="QuestionComponent"
      :question="question"
      :answer="answer"
      v-bind="currentConfig"
    />

    <input
      v-if="showCustomInput"
      :placeholder="'Свой вариант'"
      :value="answer?.custom || ''"
      @input="onCustomInput"
      class="custom-input"
    />

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