<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import StepRenderer from '@/components/quiz/StepRenderer.vue'

const store = useQuizStore()

onMounted(() => {
  store.fetchSteps()
})

const step = computed(() => store.currentStepData)
</script>

<template>
  <div v-if="step">
    <StepRenderer :step="step" />
  </div>
</template>