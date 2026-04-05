<!-- components/questions/RangeQuestion.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import type { Question } from '@/shared/quiz'

const props = defineProps<{ question: Question }>()
const store = useQuizStore()

const questionId = computed(() => props.question.id)
const firstStepAnswer = computed(() => store.answers[1]?.selected ?? null)

// 📏 Диапазон для слайдера
const SLIDER_MIN = computed(() => firstStepAnswer.value === 5 ? 20 : 30)
const SLIDER_MAX = computed(() => firstStepAnswer.value === 5 ? 60 : 200)

// 💾 Значение (может быть любым, не только в диапазоне слайдера)
const value = ref<number>(50)
const inputBuffer = ref<string>('')
const isInputFocused = ref(false)

// Инициализация
onMounted(() => {
  const qId = questionId.value
  const stored = store.answers[qId]
  
  if (stored?.value !== undefined && typeof stored.value === 'number') {
    value.value = stored.value
    inputBuffer.value = String(stored.value)
  } else if (stored?.custom) {
    // Поддержка кастомных значений из старой логики
    const num = Number(stored.custom)
    value.value = isNaN(num) ? 50 : num
    inputBuffer.value = stored.custom
  } else {
    store.setRangeAnswer(qId, value.value)
    inputBuffer.value = String(value.value)
  }
})

// Сохранение в store при изменении
watch(value, (val) => {
  store.setRangeAnswer(questionId.value, val)
  if (!isInputFocused.value) {
    inputBuffer.value = String(val)
  }
})

// 🏠 Масштаб домика: растёт от 0.6 до 2.0, но считаем от реального значения
const scale = computed(() => {
  // Прогресс считаем относительно диапазона слайдера, но с "растяжкой" для кастомных
  const clamped = Math.max(SLIDER_MIN.value, Math.min(SLIDER_MAX.value, value.value))
  const progress = (clamped - SLIDER_MIN.value) / (SLIDER_MAX.value - SLIDER_MIN.value)
  return 0.6 + Math.max(0, Math.min(1, progress)) * 1.4
})

// 🎯 Позиция домика: визуально всегда в пределах 0–100%, даже если значение вне диапазона
const housePosition = computed(() => {
  if (value.value <= SLIDER_MIN.value) return 0
  if (value.value >= SLIDER_MAX.value) return 100
  const progress = (value.value - SLIDER_MIN.value) / (SLIDER_MAX.value - SLIDER_MIN.value)
  return Math.max(0, Math.min(100, progress * 100))
})

// 🎨 Цвет домика: меняется в диапазоне, серый — если вне
const houseColor = computed(() => {
  if (value.value < SLIDER_MIN.value || value.value > SLIDER_MAX.value) {
    return '#6b7280' // серый для "нестандартного"
  }
  const progress = (value.value - SLIDER_MIN.value) / (SLIDER_MAX.value - SLIDER_MIN.value)
  const r = Math.round(0 + progress * 16)
  const g = Math.round(124 + progress * 61)
  const b = Math.round(221 - progress * 140)
  return `rgb(${r}, ${g}, ${b})`
})

// ✏️ Обработчик ввода числа
const handleNumberInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const raw = target.value.trim()
  
  // Разрешаем: пусто, отрицательные на время ввода, или цифры
  if (raw === '' || /^-?\d*$/.test(raw)) {
    inputBuffer.value = raw
    if (raw === '' || raw === '-') return
    
    const num = Number(raw)
    if (!isNaN(num)) {
      value.value = num // принимаем ЛЮБОЕ число
    }
  }
}

// Фокус/блюр
const handleFocus = () => { isInputFocused.value = true }
const handleBlur = () => {
  isInputFocused.value = false
  if (inputBuffer.value === '' || inputBuffer.value === '-') {
    inputBuffer.value = String(value.value)
  }
}
</script>

<template>
  <div class="range-question">
    
    <!-- 🔝 Домик сверху -->
    <div class="house-wrapper">
      <div 
        class="house" 
        :style="{ 
          left: `${housePosition}%`,
          transform: `translateX(-50%) scale(${scale})` 
        }"
      >
        <div class="roof" :style="{ borderBottomColor: houseColor }"></div>
        <div class="body" :style="{ borderColor: houseColor }">
          <div class="door"></div>
          <div class="window"></div>
        </div>
        <!-- Индикатор, если значение вне диапазона -->
        <span v-if="value < SLIDER_MIN || value > SLIDER_MAX" class="house-badge">!</span>
      </div>
      <div 
        class="house-arrow" 
        :style="{ 
          left: `${housePosition}%`, 
          background: `linear-gradient(to bottom, ${houseColor}, transparent)` 
        }"
      ></div>
    </div>

    <!-- 🎚️ Слайдер (всегда в пределах диапазона) -->
    <input
      type="range"
      :min="SLIDER_MIN"
      :max="SLIDER_MAX"
      step="1"
      v-model.number="value"
      class="slider"
    />

    <!-- 🔢 Значение + инпут -->
    <div class="value-controls">
      <div class="value-display">
        <span class="value-number">{{ value }}</span>
        <span class="value-unit">м²</span>
      </div>
      
      <div class="input-wrapper">
        <input
          type="text"
          inputmode="numeric"
          pattern="-?[0-9]*"
          :value="inputBuffer"
          @input="handleNumberInput"
          @focus="handleFocus"
          @blur="handleBlur"
          class="number-input"
          placeholder="введите"
        />
        <span class="input-unit">м²</span>
      </div>
    </div>

    <!-- 💡 Подсказка -->
    <div class="range-hint">
      Рекомендованный диапазон: {{ SLIDER_MIN }}–{{ SLIDER_MAX }} м²
      <span v-if="value < SLIDER_MIN || value > SLIDER_MAX" class="hint-custom">
        • Вы ввели нестандартное значение
      </span>
    </div>

  </div>
</template>

<style scoped>
.range-question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

/* 🔝 Контейнер для домика */
.house-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 90px;
}

/* 🏠 Домик */
.house {
  position: absolute;
  bottom: 28px;
  transform-origin: bottom center;
  pointer-events: none;
  transition: transform 0.15s ease-out, opacity 0.2s;
  will-change: transform, left;
}

/* Бейдж "!" для нестандартных значений */
.house-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 🔻 Стрелочка */
.house-arrow {
  position: absolute;
  bottom: 0;
  width: 2px;
  height: 20px;
  transform: translateX(-50%);
  opacity: 0.7;
  transition: background 0.2s;
}

/* Крыша */
.roof {
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 18px solid #007CDD;
  margin: 0 auto;
  transition: border-bottom-color 0.2s;
}

/* Тело */
.body {
  width: 40px;
  height: 34px;
  background: #f0f9ff;
  border: 2px solid #007CDD;
  border-top: none;
  border-radius: 0 0 4px 4px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 4px;
  padding-bottom: 2px;
  transition: border-color 0.2s, background 0.2s;
}

.door {
  width: 12px;
  height: 18px;
  background: #005fb3;
  border-radius: 0 0 2px 2px;
}

.window {
  width: 12px;
  height: 12px;
  background: #e0f2fe;
  border: 2px solid #007CDD;
  border-radius: 2px;
}

/* 🎚️ Слайдер */
.slider {
  width: 100%;
  max-width: 400px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  background: #007CDD;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  cursor: grab;
  transition: transform 0.1s;
}

.slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: #007CDD;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  cursor: grab;
  border: none;
}

/* 🔢 Блок управления */
.value-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.value-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-weight: 600;
  color: #1f2937;
}

.value-number {
  font-size: 1.75rem;
  line-height: 1;
}

.value-unit {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 400;
}

/* ✏️ Инпут */
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper:focus-within {
  border-color: #007CDD;
  box-shadow: 0 0 0 3px rgba(0,124,221,0.15);
}

.number-input {
  width: 70px;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
  outline: none;
}

.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-unit {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
}

/* 💡 Подсказка */
.range-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
}

.hint-custom {
  display: block;
  color: #ef4444;
  font-weight: 500;
  margin-top: 2px;
}

/* 📱 Адаптив */
@media (max-width: 480px) {
  .value-controls {
    flex-direction: column;
    gap: 8px;
  }
  .value-number { font-size: 1.5rem; }
  .house-wrapper { height: 80px; }
  .slider { max-width: 100%; }
}
</style>