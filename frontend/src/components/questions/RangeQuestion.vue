<!-- components/questions/RangeQuestion.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quizStore'
import type { Question } from '@/shared/quiz'

const props = defineProps<{ question: Question }>()
const store = useQuizStore()

const questionId = computed(() => props.question.id)
const firstStepAnswer = computed(() => store.answers[1]?.selected ?? null)

// Основной диапазон
const MIN_NORMAL = computed(() => firstStepAnswer.value === 5 ? 20 : 30)
const MAX_NORMAL = computed(() => firstStepAnswer.value === 5 ? 60 : 200)

// Значения
const value = ref<number>(50)           // для слайдера (в пределах диапазона)
const inputBuffer = ref<string>('')     // буфер для основного инпута
const customValue = ref<string>('')     // кастомное значение (вне диапазона)
const isCustomMode = ref<boolean>(false) // флаг: кастомный режим активен
const isInputFocused = ref(false)

// 🔍 Проверка: значение в нормальном диапазоне?
const isInNormalRange = (num: number): boolean => {
  return num >= MIN_NORMAL.value && num <= MAX_NORMAL.value
}

// Инициализация
onMounted(() => {
  const qId = questionId.value
  const stored = store.answers[qId]
  
  if (stored?.value !== undefined && typeof stored.value === 'number') {
    // Восстанавливаем из store
    if (isInNormalRange(stored.value)) {
      value.value = stored.value
      inputBuffer.value = String(stored.value)
      isCustomMode.value = false
    } else {
      // Кастомное значение
      value.value = MIN_NORMAL.value // слайдер сбрасываем на мин. для визуала
      customValue.value = String(stored.value)
      inputBuffer.value = String(stored.value)
      isCustomMode.value = true
    }
  } else if (stored?.custom) {
    // Только кастомное (без value)
    customValue.value = stored.custom
    inputBuffer.value = stored.custom
    value.value = MIN_NORMAL.value
    isCustomMode.value = true
  } else {
    // Дефолт
    store.setRangeAnswer(qId, value.value)
    inputBuffer.value = String(value.value)
  }
})

// 🔄 Синхронизация value → store (только для нормального диапазона)
watch(value, (val) => {
  if (!isCustomMode.value && isInNormalRange(val)) {
    store.setRangeAnswer(questionId.value, val)
    if (!isInputFocused.value) {
      inputBuffer.value = String(val)
    }
  }
})

// 🔄 Синхронизация customValue → store
watch(customValue, (val) => {
  if (isCustomMode.value && val.trim()) {
    store.setCustomRangeAnswer(questionId.value, Number(val.trim()))
  }
})

// 🏠 Масштаб домика (только для нормального диапазона)
const scale = computed(() => {
  if (isCustomMode.value) return 0.6 // мин. размер для кастомного
  const progress = (value.value - MIN_NORMAL.value) / (MAX_NORMAL.value - MIN_NORMAL.value)
  const clamped = Math.max(0, Math.min(1, progress))
  return 0.6 + clamped * 1.4
})

// 🎯 Позиция домика
const housePosition = computed(() => {
  if (isCustomMode.value) return 100 // домик у правого края с индикатором "..."
  const progress = (value.value - MIN_NORMAL.value) / (MAX_NORMAL.value - MIN_NORMAL.value)
  return Math.max(0, Math.min(100, progress * 100))
})

// 🎨 Цвет домика
const houseColor = computed(() => {
  if (isCustomMode.value) return '#6b7280' // серый для кастомного
  const progress = (value.value - MIN_NORMAL.value) / (MAX_NORMAL.value - MIN_NORMAL.value)
  const r = Math.round(0 + progress * 16)
  const g = Math.round(124 + progress * 61)
  const b = Math.round(221 - progress * 140)
  return `rgb(${r}, ${g}, ${b})`
})

// ✏️ Обработчик основного инпута
const handleNumberInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const raw = target.value.trim()
  
  // Разрешаем ввод: пусто или цифры
  if (raw === '' || /^\d*$/.test(raw)) {
    inputBuffer.value = raw
    
    if (raw === '') return
    
    const num = Number(raw)
    if (!isNaN(num)) {
      if (isInNormalRange(num)) {
        // ✅ В диапазоне → обычный режим
        isCustomMode.value = false
        value.value = num
        customValue.value = ''
      } else {
        // ❌ Вне диапазона → кастомный режим
        isCustomMode.value = true
        customValue.value = raw
        // Слайдер визуально показывает "на макс." или "на мин."
        value.value = num < MIN_NORMAL.value ? MIN_NORMAL.value : MAX_NORMAL.value
      }
    }
  }
}

// ✏️ Обработчик кастомного инпута
const handleCustomInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const raw = target.value.trim()
  
  if (raw === '' || /^\d*$/.test(raw)) {
    customValue.value = raw
    
    // Если в кастомном ввели значение в диапазоне → выходим из кастомного режима
    if (raw !== '') {
      const num = Number(raw)
      if (!isNaN(num) && isInNormalRange(num)) {
        isCustomMode.value = false
        value.value = num
        inputBuffer.value = String(num)
        customValue.value = ''
        store.setRangeAnswer(questionId.value, num)
      } else if (!isNaN(num)) {
        // Всё ещё вне диапазона → сохраняем как кастомное
        store.setCustomRangeAnswer(questionId.value, num)
      }
    }
  }
}

// Фокус/блюр для основного инпута
const handleFocus = () => { isInputFocused.value = true }
const handleBlur = () => {
  isInputFocused.value = false
  // Если пусто — восстанавливаем текущее значение
  if (inputBuffer.value === '') {
    inputBuffer.value = isCustomMode.value ? customValue.value : String(value.value)
  }
}
</script>

<template>
  <div class="range-question">
    
    <!-- 🔝 Домик сверху -->
    <div class="house-wrapper">
      <div 
        class="house" 
        :class="{ 'house--custom': isCustomMode }"
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
        <!-- Индикатор "..." для кастомного значения -->
        <span v-if="isCustomMode" class="house-badge">⋯</span>
      </div>
      <div 
        class="house-arrow" 
        :style="{ 
          left: `${housePosition}%`, 
          background: `linear-gradient(to bottom, ${houseColor}, transparent)` 
        }"
      ></div>
    </div>

    <!-- 🎚️ Слайдер -->
    <input
      type="range"
      :min="MIN_NORMAL"
      :max="MAX_NORMAL"
      step="1"
      v-model.number="value"
      :disabled="isCustomMode"
      class="slider"
      :class="{ 'slider--custom': isCustomMode }"
    />

    <!-- 🔢 Основной инпут + кастомный режим -->
    <div class="value-controls">
      
      <!-- Отображение текущего значения -->
      <div class="value-display" :class="{ 'value-display--custom': isCustomMode }">
        <span class="value-number">{{ isCustomMode ? customValue || '—' : value }}</span>
        <span class="value-unit">м²</span>
      </div>
      
      <!-- Основной инпут (всегда видим) -->
      <div class="input-wrapper">
        <input
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :value="inputBuffer"
          @input="handleNumberInput"
          @focus="handleFocus"
          @blur="handleBlur"
          class="number-input"
          :class="{ 'number-input--custom': isCustomMode }"
          placeholder="введите"
        />
        <span class="input-unit">м²</span>
      </div>
    </div>

    <!-- 🔥 Кастомный инпут (появляется при выходе за диапазон) -->
    <Transition name="slide">
      <div v-if="isCustomMode" class="custom-input-block">
        <label class="custom-input-label">
          <span>Ваше значение:</span>
          <div class="custom-input-wrapper">
            <input
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              v-model="customValue"
              @input="handleCustomInput"
              class="custom-input"
              placeholder="например, 250"
            />
            <span class="custom-input-unit">м²</span>
          </div>
        </label>
        <p class="custom-input-hint">
          Укажите площадь, если она не входит в диапазон {{ MIN_NORMAL }}–{{ MAX_NORMAL }} м²
        </p>
      </div>
    </Transition>

    <!-- 💡 Подсказка диапазона -->
    <div class="range-hint" :class="{ 'range-hint--hidden': isCustomMode }">
      Стандартный диапазон: от {{ MIN_NORMAL }} до {{ MAX_NORMAL }} м²
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
  will-change: transform;
}

.house--custom {
  opacity: 0.7;
}

/* Бейдж "..." для кастомного режима */
.house-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background: #6b7280;
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
}

/* 🔻 Стрелочка */
.house-arrow {
  position: absolute;
  bottom: 0;
  width: 2px;
  height: 20px;
  transform: translateX(-50%);
  opacity: 0.7;
  transition: background 0.2s, opacity 0.2s;
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

.house--custom .body {
  background: #f9fafb;
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
  -webkit-appearance: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider--custom {
  background: repeating-linear-gradient(
    45deg,
    #e5e7eb,
    #e5e7eb 10px,
    #d1d5db 10px,
    #d1d5db 20px
  );
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
  transition: transform 0.1s, box-shadow 0.1s;
}

.slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
  background: #9ca3af;
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
  transition: color 0.2s;
}

.value-display--custom {
  color: #6b7280;
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

/* ✏️ Основной инпут */
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
  width: 60px;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
  outline: none;
  -moz-appearance: textfield;
}

.number-input--custom {
  color: #6b7280;
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

/* 🔥 Кастомный блок */
.custom-input-block {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-input-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.875rem;
  color: #92400e;
  font-weight: 500;
}

.custom-input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 2px solid #fcd34d;
  border-radius: 8px;
  padding: 8px 12px;
}

.custom-input {
  flex: 1;
  min-width: 80px;
  border: none;
  background: transparent;
  font-size: 1.125rem;
  font-weight: 600;
  color: #92400e;
  outline: none;
  -moz-appearance: textfield;
}

.custom-input::-webkit-outer-spin-button,
.custom-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.custom-input-unit {
  font-size: 0.875rem;
  color: #b45309;
  font-weight: 400;
}

.custom-input-hint {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #b45309;
  line-height: 1.4;
}

/* 💡 Подсказка диапазона */
.range-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
  transition: opacity 0.2s;
}

.range-hint--hidden {
  opacity: 0;
  height: 0;
  margin: 0;
  overflow: hidden;
}

/* 🎬 Анимация появления */
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 📱 Адаптив */
@media (max-width: 480px) {
  .value-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .value-number {
    font-size: 1.5rem;
  }
  
  .house-wrapper {
    height: 80px;
  }
  
  .slider {
    max-width: 100%;
  }
  
  .custom-input-block {
    max-width: 100%;
  }
}
</style>