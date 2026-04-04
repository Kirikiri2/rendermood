<script setup lang="ts">
import type { Question } from '@/shared/quiz';
import { useQuizStore } from '@/stores/quizStore'


const props = defineProps<{
  question: Question
  answer?: string
}>()

const store = useQuizStore()

const update = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setAnswer(props.question.id, target.value)
}
</script>

<template>
  <input
    :value="answer"
    @input="update"
    placeholder="Введите значение"
  />
</template>