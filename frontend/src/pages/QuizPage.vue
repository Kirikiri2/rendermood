<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import StepRenderer from '@/components/quiz/StepRenderer.vue'

const store = useQuizStore()

onMounted(async () => {
  await store.fetchSteps()
})

const step = computed(() => store.currentStepData)
</script>

<template>
  <StepRenderer v-if="step" :step="step" />
</template>