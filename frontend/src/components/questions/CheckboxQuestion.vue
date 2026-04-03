<script setup lang="ts">
import type { Question } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'

const { question } = defineProps<{ question: Question }>()

const store = useQuizStore()
</script>

<template>
  <div>
    <div
      v-for="opt in question.options"
      :key="opt.id"
      @click="store.toggleCheckbox(question.id, opt.id)"
      style="cursor: pointer; margin: 10px; border: 1px solid #ccc; padding: 10px"
    >
      {{ opt.text }}
    </div>
  </div>
</template>
