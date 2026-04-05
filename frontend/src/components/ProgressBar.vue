<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuizStore } from '@/stores/quizStore'

const store = useQuizStore()
const { steps } = storeToRefs(store)

// только шаги с вопросами
const questionSteps = computed(() =>
  steps.value.filter((s) => s.type === 'question')
)

const total = computed(() => questionSteps.value.length)

// индекс текущего вопроса
const currentIndex = computed(() => {
  const current = store.currentStep

  if (current < 0) return -1

  const stepsBefore = steps.value.slice(0, current + 1)

  return stepsBefore.filter((s) => s.type === 'question').length - 1
})

// процент
const percent = computed(() => {
  if (total.value === 0 || currentIndex.value < 0) return 0
  return Math.min(100, Math.round(((currentIndex.value + 1) / total.value) * 100))
})
</script>

<template>
  <div v-if="currentIndex >= 0" class="progress-wrapper">
    <div
      class="progress-fill"
      :style="{ width: percent + '%' }"
    ></div>
  </div>
</template>

<style scoped>
.progress-wrapper {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #06b6d4);
  transition: width 0.4s ease;
  border-radius: 3px;
}
</style>