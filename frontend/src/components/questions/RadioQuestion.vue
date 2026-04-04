<script setup lang="ts">
import type { Question } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'

const props = defineProps<{
  question: Question
}>()

const store = useQuizStore()

const select = (id: number) => {
  store.setAnswer(props.question.id, id)
  store.nextStep()
}
</script>

<template>
  <div>
    <div
      v-for="opt in question.options"
      :key="opt.id"
      @click="select(opt.id)"
      style="cursor: pointer; margin: 10px; border: 1px solid #ccc; padding: 10px"
    >
      {{ opt.text }}
    </div>
  </div>
</template>
