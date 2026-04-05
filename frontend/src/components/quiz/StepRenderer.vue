<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'           // ← обязательно добавь
import type { Component } from 'vue'
import type { Question } from '@/shared/quiz'

import InputQuestion from '@/components/questions/InputQuestion.vue'
import RadioQuestion from '@/components/questions/RadioQuestion.vue'
import CheckboxQuestion from '@/components/questions/CheckboxQuestion.vue'
import RangeQuestion from '@/components/questions/RangeQuestion.vue'
import SubmissionStep from '@/components/SubmissionStep.vue'
import { useQuizStore } from '@/stores/quizStore'
import CarouselQuestion from '@/components/questions/CarouselQuestion.vue'
import ProgressBar from '../ProgressBar.vue'

const store = useQuizStore()

// ✅ Правильный способ для getter'ов
const { currentStepData } = storeToRefs(store)

const componentMap: Record<string, Component> = {
  input: InputQuestion,
  radio: RadioQuestion,
  checkbox: CheckboxQuestion,
  range: RangeQuestion,
  slider: RangeQuestion,
  carousel: CarouselQuestion,
}

const getComponent = (question: Question): Component => 
  componentMap[question.type] || InputQuestion

const isStepValid = computed(() => {
  const current = currentStepData.value
  if (!current || current.type !== 'question' || !current.question) {
    return true
  }
  return store.isQuestionValid(current.question.id, current.question.type)
})

const isFormValid = computed(() => {
  const a = store.answers
  const f = store.form
  return (
    f.name.trim().length >= 2 &&
    /^[\d\s\+\-\(\)]{10,}$/.test(f.phone.trim()) &&
    Array.isArray(a[2]?.selected) &&
    a[2].selected.length > 0 &&
    typeof a[3]?.value === 'number' &&
    a[5]?.selected &&
    f.agree
  )
})
</script>

<template>
  <div v-if="currentStepData" class="max-w-2xl mx-auto p-4">

    
    <h2 class="text-2xl font-bold mb-6">{{ currentStepData.title }}</h2>

    <ProgressBar />

    <component
      v-if="currentStepData.type === 'question' && currentStepData.question"
      :is="getComponent(currentStepData.question)"
      :question="currentStepData.question"
      @complete="store.nextStep"
    />

    <SubmissionStep v-if="currentStepData.type === 'form'" />

    <div class="flex gap-3 mt-8">
      <button
        @click="store.prevStep"
        :disabled="store.currentStep === 0"
        class="px-6 py-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Назад
      </button>

      <button
        v-if="currentStepData.type !== 'form'"
        @click="store.nextStep"
        :disabled="!isStepValid"
        class="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Вперед
      </button>

      <button
        v-if="currentStepData.type === 'form'"
        @click="store.submitQuiz"
        :disabled="!isFormValid"
        class="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Отправить
      </button>
    </div>
  </div>
</template>