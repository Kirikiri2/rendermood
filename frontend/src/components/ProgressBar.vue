<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuizStore } from '@/stores/quizStore'

const store = useQuizStore()
const { currentStepData, steps } = storeToRefs(store)

const questionSteps = computed(() => 
  steps.value.filter(s => s.type === 'question')
)

const total = computed(() => questionSteps.value.length)

const currentIndex = computed(() => {
  const step = currentStepData.value
  if (!step || step.type !== 'question') return -1

  const idx = questionSteps.value.findIndex(s => s.id === step.id)
  return idx >= 0 ? idx : -1
})

const percent = computed(() => {
  if (total.value === 0 || currentIndex.value < 0) return 0
  return Math.min(100, Math.round(((currentIndex.value + 1) / total.value) * 100))
})
</script>

<template>
  <div v-if="currentIndex >= 0" class="my-6">
    <!-- Дебаг (можно потом удалить) -->
    <div class="text-[10px] text-gray-400 mb-2">
      Шаг {{ currentIndex + 1 }} из {{ total }} • {{ percent }}%
    </div>

    <!-- Сама полоса прогресса -->
    <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        class="h-full bg-linear-to-r from-blue-600 to-cyan-500 transition-all duration-500 ease-out"
        :style="{ width: percent + '%' }"
      ></div>
    </div>
  </div>
</template>