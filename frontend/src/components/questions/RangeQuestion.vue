<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import type { Question } from '@/shared/quiz'

const props = defineProps<{
  question: Question
}>()

const store = useQuizStore()

// Безопасное получение ID вопроса
const questionId = computed(() => props.question?.id)

// Первый шаг — тип жилья
const firstStepAnswer = computed(() => {
  const answer = store.answers[1]
  return answer?.selected ?? null
})

const value = ref<number>(50)

// ✅ Явно указываем тип number, чтобы TS не выводил литералы (20|30) и не ругался
const min = computed((): number => firstStepAnswer.value === 1 ? 20 : 30)
const max = computed((): number => firstStepAnswer.value === 1 ? 60 : 200)
const step = 1

onMounted(() => {
  const qId = questionId.value
  if (qId === undefined) return

  const stored = store.answers[qId]?.value
  if (typeof stored === 'number' && !isNaN(stored)) {
    value.value = stored
  } else {
    // ✅ Сразу сохраняем дефолтное значение в стор, чтобы валидация прошла
    store.setRangeAnswer(qId, value.value)
  }
})

watch(value, (val) => {
  const qId = questionId.value
  if (qId === undefined) return
  store.setRangeAnswer(qId, val)
})

// Масштабирование домика (проверка деления на ноль убрана, т.к. max всегда > min)
const scale = computed(() => {
  const minVal = min.value
  const maxVal = max.value
  const progress = (value.value - minVal) / (maxVal - minVal)
  return 0.6 + progress * 1.4
})
</script>

<template>
  <div class="range-question">
    <div class="value-display">{{ value }} м²</div>

    <div class="slider-container">
      <!-- Домик на чистом CSS в цвете #007CDD -->
      <div class="house" :style="{ transform: `scale(${scale})` }">
        <div class="roof"></div>
        <div class="body">
          <div class="door"></div>
          <div class="window"></div>
        </div>
      </div>

      <!-- Ползунок -->
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        v-model.number="value"
        class="slider"
      />
    </div>
  </div>
</template>

<style scoped>
.range-question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.value-display {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1f2937;
  text-align: center;
}

.slider-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  align-items: flex-end;
  min-height: 100px;
  padding: 10px 0 20px;
}

/* === ДОМИК === */
.house {
  --house-color: #007CDD;
  
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) scale(1);
  transform-origin: bottom center;
  transition: transform 0.25s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  pointer-events: none;
}

.roof {
  width: 0;
  height: 0;
  border-left: 22px solid transparent;
  border-right: 22px solid transparent;
  border-bottom: 18px solid var(--house-color);
  border-radius: 2px 2px 0 0;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.body {
  width: 44px;
  height: 36px;
  background: #f0f9ff;
  border: 2px solid var(--house-color);
  border-top: none;
  border-radius: 0 0 4px 4px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 6px;
  padding-bottom: 4px;
  box-sizing: border-box;
}

.door {
  width: 14px;
  height: 20px;
  background: #005fb3;
  border: 1px solid #004d99;
  border-radius: 2px 2px 0 0;
}

.window {
  width: 12px;
  height: 12px;
  background: #e0f2fe;
  border: 2px solid var(--house-color);
  border-radius: 2px;
  position: relative;
}
.window::after,
.window::before {
  content: '';
  position: absolute;
  background: var(--house-color);
}
.window::after {
  top: 50%;
  left: 2px;
  right: 2px;
  height: 2px;
  transform: translateY(-50%);
}
.window::before {
  left: 50%;
  top: 2px;
  bottom: 2px;
  width: 2px;
  transform: translateX(-50%);
}

/* === ПОЛЗУНОК === */
.slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: #d1d5db;
  border-radius: 4px;
  outline: none;
  margin: 0;
  position: relative;
  z-index: 3;
  cursor: pointer;
}

.slider::-moz-range-track {
  height: 8px;
  background: #d1d5db;
  border-radius: 4px;
  border: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #007CDD;
  border: 2px solid #005fb3;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
.slider::-webkit-slider-thumb:hover {
  background: #005fb3;
  transform: scale(1.05);
}
.slider::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: #007CDD;
  border: 2px solid #005fb3;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* === АДАПТИВ === */
@media (max-width: 480px) {
  .slider-container { min-height: 90px; }
  .house { bottom: 32px; }
  .roof {
    border-left-width: 18px;
    border-right-width: 18px;
    border-bottom-width: 14px;
  }
  .body { width: 36px; height: 30px; }
  .door { width: 12px; height: 16px; }
  .window { width: 10px; height: 10px; }
}
</style>