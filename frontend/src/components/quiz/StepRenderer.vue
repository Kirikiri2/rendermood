<script setup lang="ts">
import { computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import QuestionRenderer from './QuestionRenderer.vue'
import type { Step } from '@/shared/quiz';


const props = defineProps<{
  step: Step
}>()

const store = useQuizStore()

const answer = computed(() => store.answers[props.step.question.id])

const isValid = computed(() => {
  const q = props.step.question
  const value = store.answers[q.id]

  if (!value) return false
  if (q.type === 'checkbox') return Array.isArray(value) && value.length > 0

  return true
})
</script>

<template>
  <div>
    <h2>{{ step.title }}</h2>
    <p>{{ step.question.text }}</p>

    <QuestionRenderer
      :question="step.question"
      :answer="answer"
    />

    <div style="margin-top:20px">
      <button v-if="store.currentStep > 0" @click="store.prevStep()">
        Назад
      </button>

      <button
        v-if="step.question.type !== 'radio'"
        :disabled="!isValid"
        @click="store.nextStep()"
      >
        Далее
      </button>
    </div>
  </div>
</template>