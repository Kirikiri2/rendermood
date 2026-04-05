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
/* =========================================
   1. OVERLAY (Стандартный)
   ========================================= */
.quiz-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

/* =========================================
   2. SHEET (Стандартный)
   ========================================= */
.quiz-sheet {
  position: relative;
  width: 95vw;
  max-width: 1050px;
  height: 80vh;
  min-height: 600px;
  background: #FFFFFF;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  z-index: 1;
}

/* =========================================
   3. SHADOW LAYER (Стандартный)
   ========================================= */
.quiz-sheet__shadow-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: #B3D4F0;
  border-radius: 8px;
  transform: translate(20px, 20px);
  z-index: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

/* =========================================
   4. HEADER (Стандартный)
   ========================================= */
.sheet-header {
  border-radius: 8px 8px 0 0;
  z-index: 1;
  padding: 40px 50px 20px;
  position: relative;
  flex-shrink: 0;
  background: #FFFFFF;
}

.progress-bar {
  position: absolute;
  top: 20px; left: 50px;
  width: 250px;
  height: 6px;
  background: #3B82F6;
  border-radius: 2px;
}

.sheet-title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
}

/* =========================================
   5. BODY (Центрирование контента)
   ========================================= */
.sheet-body {
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 20px 50px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Центрируем слайдер */
  justify-content: center;
  background: #FFFFFF;
}

/* =========================================
   6. RANGE UI (Стили слайдера)
   ========================================= */
.range-container {
  width: 100%;
  max-width: 800px; /* Широкий слайдер как на картинке */
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
  height: 80px; /* Место для домика над полосой */
  margin-bottom: -10px; /* Накладываем на слайдер */
  z-index: 10;
}

/* 🏠 Сам домик */
.house {
  position: absolute;
  bottom: 0;
  transform: translateX(-50%); /* Центрируем относительно точки */
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 0.1s linear; /* Плавное движение */
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
  height: 8px; /* Толщина полосы */
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  background: #E0F2FE; /* Цвет пустой части */
}

/* Бегунок (Скрываем стандартный, так как у нас есть домик) */
.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  height: 0;
  opacity: 0;
}

.custom-slider::-moz-range-thumb {
  width: 0;
  height: 0;
  border: none;
  opacity: 0;
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
  font-size: 64px; /* Огромная цифра */
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
   7. FOOTER (Стандартный)
   ========================================= */
.sheet-footer {
  border-radius: 0 0 8px 8px;
  z-index: 1;
  height: 80px;
  background-color: #F0F9FF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px;
  flex-shrink: 0;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  padding: 10px 20px;
  border-radius: 8px;
  transition: background 0.2s;
}

.nav-btn:hover { background: rgba(0, 0, 0, 0.05); }

/* =========================================
   АДАПТИВ
   ========================================= */
@media (max-width: 768px) {
  .quiz-sheet {
    height: 100vh;
    width: 100vw;
    border-radius: 0;
    max-height: none;
  }
  .quiz-sheet__shadow-layer { display: none; }
  .sheet-header { padding: 25px 20px 15px; }
  .sheet-title { font-size: 24px; }
  .progress-bar { left: 20px; width: 150px !important; }
  .sheet-body { padding: 20px; }
  
  .value-number { font-size: 48px; }
  .value-unit { font-size: 18px; }
  
  .house { transform: translateX(-50%) scale(0.8); } /* Уменьшаем домик на мобилках */
  
  .sheet-footer { padding: 0 20px; height: 70px; }
  .nav-btn { font-size: 18px; }
}
</style>