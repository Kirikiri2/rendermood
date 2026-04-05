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
  <!-- 1. ЗАТЕМНЕННЫЙ ФОН (Оверлей) -->
  <div class="quiz-overlay">
    
    <!-- 2. БЛАНК -->
    <div class="quiz-sheet">
      
      <!-- ЭФФЕКТ ДВОЙНОЙ КАРТОЧКИ -->
      <div class="quiz-sheet__shadow-layer"></div>
      
      <!-- ВЕРХНЯЯ ЧАСТЬ -->
      <header class="sheet-header">
        <div class="progress-bar"></div>
        <h2 class="sheet-title">{{ question.text }}</h2>
      </header>

      <!-- СКРОЛЛИРУЕМАЯ ЗОНА -->
      <main class="sheet-body">
        
        <div class="range-container">
          
          <!-- 🏠 Домик (Позиционируется через :style) -->
          <div class="house-wrapper">
            <div class="house" :style="{ left: `${housePosition}%` }">
              <!-- Крыша -->
              <div class="roof"></div>
              <!-- Тело домика -->
              <div class="body">
                <div class="window"></div>
                <div class="door"></div>
              </div>
              <!-- Стрелка вниз -->
              <div class="arrow"></div>
            </div>
          </div>

          <!-- 🎚️ Слайдер (С двухцветным фоном) -->
          <input
            type="range"
            :min="SLIDER_MIN"
            :max="SLIDER_MAX"
            step="1"
            v-model.number="value"
            class="custom-slider"
            :style="{ 
              background: `linear-gradient(to right, #3B82F6 ${housePosition}%, #E0F2FE ${housePosition}%)` 
            }"
          />

          <!-- 🔢 Крупное значение -->
          <div class="value-display">
            <span class="value-number">{{ value }}</span>
            <span class="value-unit">кв.м</span>
          </div>

          <!-- ✏️ Поле ввода (Для ручного ввода, как в старом коде) -->
          <div class="input-row">
            <input
              type="text"
              inputmode="numeric"
              :value="inputBuffer"
              @input="handleNumberInput"
              @focus="handleFocus"
              @blur="handleBlur"
              class="manual-input"
              placeholder="Введите вручную"
            />
          </div>

        </div>

      </main>

      <!-- ПОДВАЛ (Навигация) -->
      <footer class="sheet-footer">
        <button 
          type="button" 
          class="nav-btn btn-back"
          @click="store.prevStep"
          :disabled="store.currentStep === 0" 
          :style="{ opacity: store.currentStep === 0 ? 0.5 : 1, cursor: store.currentStep === 0 ? 'default' : 'pointer' }"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <button 
          type="button" 
          class="nav-btn btn-next"
          @click="store.nextStep"
        >
          Далее
        </button>
      </footer>

    </div>
  </div>
</template>

<style scoped>
@import '@/assets/quiz_layout.css';

/* =========================================
   1. RANGE UI (Стили слайдера)
   ========================================= */
.range-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 20px 0;
}

/* 🏠 Обертка домика */
.house-wrapper {
  position: relative;
  width: 100%;
  height: 80px;
  margin-bottom: -10px;
  z-index: 10;
}

/* 🏠 Сам домик */
.house {
  position: absolute;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 0.1s linear;
}

/* Крыша */
.roof {
  width: 0;
  height: 0;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-bottom: 24px solid #3B82F6;
  margin-bottom: -1px;
}

/* Тело */
.body {
  width: 48px;
  height: 36px;
  background: #FFFFFF;
  border: 3px solid #3B82F6;
  border-radius: 4px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

/* Окно */
.window {
  width: 14px;
  height: 14px;
  background: #3B82F6;
  border-radius: 2px;
  margin-bottom: 4px;
}

/* Дверь */
.door {
  width: 14px;
  height: 14px;
  background: #3B82F6;
  border-radius: 2px 2px 0 0;
  margin-bottom: -3px;
}

/* Стрелочка вниз */
.arrow {
  width: 0; 
  height: 0; 
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #3B82F6;
  margin-top: -2px;
}

/* 🎚️ Кастомный слайдер */
.custom-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  background: #E0F2FE;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0; height: 0; opacity: 0;
}

.custom-slider::-moz-range-thumb {
  width: 0; height: 0; border: none; opacity: 0;
}

/* 🔢 Крупное значение */
.value-display {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.value-number {
  font-size: 64px;
  font-weight: 800;
  color: #3B82F6;
  line-height: 1;
}

.value-unit {
  font-size: 24px;
  font-weight: 600;
  color: #93C5FD;
  margin-bottom: 12px;
}

/* ✏️ Поле ручного ввода */
.input-row {
  width: 100%;
  max-width: 300px;
}

.manual-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 18px;
  text-align: center;
  color: #111827;
  outline: none;
  transition: all 0.2s;
}

.manual-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* =========================================
   2. АДАПТИВ (ТОЛЬКО ДЛЯ КОМПОНЕНТА)
   ========================================= */
@media (max-width: 768px) {
  .value-number { font-size: 48px; }
  .value-unit { font-size: 18px; }
  .house { transform: translateX(-50%) scale(0.8); }
  .manual-input { padding: 10px 14px; font-size: 16px; }
}

@media (max-width: 374px) {
  .value-number { font-size: 36px; }
  .value-unit { font-size: 14px; }
  .house { transform: translateX(-50%) scale(0.7); }
  .range-container { gap: 24px; }
}
</style>