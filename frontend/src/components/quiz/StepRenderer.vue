<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { Component } from 'vue'
import type { Question } from '@/shared/quiz'

import InputQuestion from '@/components/questions/InputQuestion.vue'
import RadioQuestion from '@/components/questions/RadioQuestion.vue'
import CheckboxQuestion from '@/components/questions/CheckboxQuestion.vue'
import RangeQuestion from '@/components/questions/RangeQuestion.vue'
import SubmissionStep from '@/components/SubmissionStep.vue'
import { useQuizStore } from '@/stores/quizStore'
import CarouselQuestion from '@/components/questions/CarouselQuestion.vue'


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

const getComponent = (question: Question): Component => componentMap[question.type] || InputQuestion

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
  <div v-if="currentStepData" class="max-w-3xl mx-auto px-6 py-10">
    <h2 class="text-3xl font-bold mb-10 text-center">{{ currentStepData.title }}</h2>

    <component
      v-if="currentStepData.type === 'question' && currentStepData.question"
      :is="getComponent(currentStepData.question)"
      :question="currentStepData.question"
      @complete="store.nextStep"
    />

    <SubmissionStep v-if="currentStepData.type === 'form'" />

    <div class="flex gap-4 mt-12">
      <button
        @click="store.prevStep"
        :disabled="store.currentStep === 0"
        class="px-8 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
      >
        Назад
      </button>

      <button
        v-if="currentStepData.type !== 'form'"
        @click="store.nextStep"
        :disabled="!isStepValid"
        class="flex-1 px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
      >
        Вперед
      </button>

      <button
        v-if="currentStepData.type === 'form'"
        @click="store.submitQuiz"
        :disabled="!isFormValid"
        class="flex-1 px-8 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
      >
        Отправить
      </button>
    </div>
  </div>
</template>
