<script setup lang="ts">
import type { AnswerValue, Question } from '@/shared/quiz';
import RadioQuestion from '../questions/RadioQuestion.vue';
import CheckboxQuestion from '../questions/CheckboxQuestion.vue';
import InputQuestion from '../questions/InputQuestion.vue';




const props = defineProps<{
  question: Question
  answer?: AnswerValue
}>()

const getComponent = () => {
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
  <component
    :is="getComponent()"
    :question="question"
    :answer="answer"
  />
</template>