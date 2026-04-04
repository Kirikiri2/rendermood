<script setup lang="ts">
import type { AnswerValue, Question } from '@/shared/quiz'
import RadioQuestion from '../questions/RadioQuestion.vue'
import CheckboxQuestion from '../questions/CheckboxQuestion.vue'
import InputQuestion from '../questions/InputQuestion.vue'
import { useQuizStore } from '@/stores/quizStore'
import { stepConfig } from '@/config/stepConfig'
import RangeQuestion from '../questions/RangeQuestion.vue'

const props = defineProps<{
  question: Question
  answer?: AnswerValue
}>()
const store = useQuizStore()
const onCustomInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setCustomInput(props.question.id, target.value)
}
const getComponent = () => {
  const config = stepConfig[props.question.stepId]

  if (config?.component === 'range') {
    return RangeQuestion
  }

  switch (props.question.type) {
    case 'radio':
      return RadioQuestion
    case 'checkbox':
      return CheckboxQuestion
    case 'input':
      return InputQuestion
  }
}
</script>

<template>
  <component :is="getComponent()" :question="question" :answer="answer" />

  <input placeholder="Свой вариант" :value="answer?.custom || ''" @input="onCustomInput" />
</template>
