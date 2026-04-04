<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'          
import type { Question } from '@/shared/quiz'

import InputQuestion from '@/components/questions/InputQuestion.vue'
import RadioQuestion from '@/components/questions/RadioQuestion.vue'
import CheckboxQuestion from '@/components/questions/CheckboxQuestion.vue'
import RangeQuestion from '@/components/questions/RangeQuestion.vue'

import { useQuizStore } from '@/stores/quizStore'

const store = useQuizStore()
const step = computed(() => store.currentStepData)


const componentMap: Record<string, Component> = {
  input: InputQuestion,
  radio: RadioQuestion,
  checkbox: CheckboxQuestion,
  range: RangeQuestion,
}

const getQuestionComponent = (question: Question): Component => {
  return componentMap[question.type] || InputQuestion
}
</script>

<template>
  <div v-if="step && step.question">
    <h2>{{ step.title }}</h2>

    <component
      :is="getQuestionComponent(step.question)"
      :question="step.question"
    />

    <div style="margin-top: 20px">
      <button @click="store.prevStep" :disabled="store.currentStep === 0">Назад</button>
      <button @click="store.nextStep" :disabled="store.currentStep >= store.steps.length - 1">Вперед</button>
    </div>
  </div>
</template>