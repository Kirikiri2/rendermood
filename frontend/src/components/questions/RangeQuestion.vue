<script setup lang="ts">
import { computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import { stepConfig } from '@/config/stepConfig'
import type { AnswerValue, Question } from '@/shared/quiz'

const props = defineProps<{
  question: Question
  answer?: AnswerValue
  min?: number
  max?: number
  step?: number
}>()

const store = useQuizStore()

const config = stepConfig[props.question.stepId]

const value = computed(() => {
  return Number(store.answers[props.question.id]?.custom) || 50
})

const update = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setCustomInput(props.question.id, target.value)
}
</script>

<template>
  <div>
    <div>{{ value }} м²</div>

    <input
      type="range"
      :min="config?.min ?? 0"
      :max="config?.max ?? 100"
      :step="config?.step ?? 1"
      :value="value"
      @input="update"
    />
  </div>
</template>
