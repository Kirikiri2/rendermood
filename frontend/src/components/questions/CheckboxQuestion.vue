<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Question, Option } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'
import ProgressBar from '../ProgressBar.vue';

const props = defineProps<{ question: Question }>()
const store = useQuizStore()
const customValue = ref('')

// 🔍 Определяем выбранный propertyType из шага 1
const selectedPropertyType = computed<'residential' | 'commercial' | null>(() => {
  const answer = store.answers[1]
  if (!answer?.selected) return null

  const step1 = store.steps.find((s) => s.question?.id === 1)?.question
  const selectedOpt = step1?.options?.find((o) => o.id === answer.selected)
  return selectedOpt?.propertyType ?? null
})

// Текущий ответ на этот вопрос
const currentAnswer = computed(() => store.answers[props.question.id] || {})
const selectedIds = computed<number[]>(() =>
  Array.isArray(currentAnswer.value.selected) ? currentAnswer.value.selected : [],
)

// 🔍 Опция "Другое"
const isOtherOption = (opt: Option) =>
  opt.text.toLowerCase().includes('другое') || opt.text.toLowerCase().includes('other')

const otherOption = computed(() => props.question.options?.find(isOtherOption))
const isOtherSelected = computed(
  () => otherOption.value && selectedIds.value.includes(otherOption.value.id),
)

// 🎯 ФИЛЬТРАЦИЯ: показываем только подходящие по propertyType + универсальные
const visibleOptions = computed(() => {
  const options = props.question.options || []

  // Если тип не выбран или "Другое" → показываем ВСЕ
  if (!selectedPropertyType.value) {
    return options
  }

  // Фильтруем: совпадающий тип ИЛИ без типа (универсальные)
  return options.filter(
    (opt) => opt.propertyType === selectedPropertyType.value || !opt.propertyType,
  )
})
watch(
  () => currentAnswer.value?.custom,
  (val) => {
    if (val) customValue.value = val
  },
  { immediate: true },
)

// Переключение чекбокса
const toggleOption = (optionId: number) => {
  store.toggleCheckbox(props.question.id, optionId)
}

// Ввод кастомного значения
const updateCustom = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  customValue.value = val
  store.setCustomInput(props.question.id, val)
}

// Валидация
const isEmpty = computed(() => selectedIds.value.length === 0)
</script>

<template>
  <div class="quiz-overlay">
    <div class="quiz-sheet">
      <div class="quiz-sheet__shadow-layer"></div>

      <header class="sheet-header">
        <ProgressBar />
        <h2 class="sheet-title">{{ question.text }}</h2>
      </header>

      <main class="sheet-body">
        <!-- Подсказка о фильтре (опционально) -->
        <p v-if="selectedPropertyType" class="filter-hint">
          Показаны зоны для:
          {{ selectedPropertyType === 'residential' ? 'жилого' : 'коммерческого' }} помещения
        </p>

        <div class="options-grid">
          <label
            v-for="option in visibleOptions"
            :key="option.id"
            class="option-card"
            :class="[
              { 'is-selected': selectedIds.includes(option.id) },
              { 'is-invalid': isEmpty && !selectedIds.includes(option.id) },
              { 'is-full-width': isOtherOption(option) },
            ]"
          >
            <input
              type="checkbox"
              :checked="selectedIds.includes(option.id)"
              @change="toggleOption(option.id)"
              class="hidden-checkbox"
            />
            <span class="option-text">{{ option.text }}</span>
          </label>
        </div>

        <!-- Блок "Другое" -->
        <div v-if="isOtherSelected" class="other-input-area animate-fade-in">
          <input
            v-model="customValue"
            @input="updateCustom"
            type="text"
            placeholder="Укажите вашу зону"
            class="modern-input"
            :class="{ 'input-error': !customValue.trim() }"
            autofocus
          />
          <p v-if="isOtherSelected && !customValue.trim()" class="error-text">
            ⚠️ Пожалуйста, укажите название зоны
          </p>
        </div>

        <!-- Сообщение об ошибке валидации -->
        <Transition name="slide">
          <p v-if="isEmpty && visibleOptions.length" class="validation-msg">
            <svg class="icon-warn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Выберите хотя бы один вариант
          </p>
        </Transition>

        <!-- Если после фильтрации ничего не осталось -->
        <p v-if="!visibleOptions.length" class="empty-state">
          ⚠️ Для выбранного типа помещения нет доступных зон
        </p>
      </main>

      <footer class="sheet-footer">
        <button
          type="button"
          class="nav-btn btn-back"
          @click="store.prevStep"
          :disabled="store.currentStep === 0"
          :style="{
            opacity: store.currentStep === 0 ? 0.5 : 1,
            cursor: store.currentStep === 0 ? 'default' : 'pointer',
          }"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          class="nav-btn btn-next"
          :class="{ 'btn-disabled': isEmpty }"
          :disabled="isEmpty"
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
   1. GRID & CARDS
   ========================================= */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.option-card {
  position: relative;
  background-color: #f0f7ff;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}

.option-card:hover {
  background-color: #e1eeff;
  transform: translateY(-2px);
}

.option-card.is-selected {
  background-color: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.option-card.is-full-width {
  grid-column: 1 / -1;
  width: 100%;
}

.option-text {
  font-size: 20px;
  font-weight: 500;
  text-align: center;
}

.hidden-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* =========================================
   2. INPUTS & OTHER
   ========================================= */
.other-input-area {
  margin-top: 10px;
  grid-column: 1 / -1;
}

.modern-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
  background: #f8fafc;
}

.modern-input:focus {
  border-color: #3b82f6;
  background: #ffffff;
}

.modern-input.input-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-text {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
}

/* =========================================
   3. UTILS & ANIMATIONS
   ========================================= */
.validation-msg {
  color: #ef4444;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.icon-warn {
  width: 20px;
  height: 20px;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* =========================================
   4. АДАПТИВ (ТОЛЬКО ДЛЯ КОМПОНЕНТА)
   ========================================= */
@media (max-width: 900px) {
  .options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .option-card {
    padding: 16px;
    min-height: 50px;
  }
}

@media (max-width: 374px) {
  .option-card {
    padding: 12px;
    min-height: 44px;
  }
  .option-text {
    font-size: 16px;
  }
  .modern-input {
    padding: 12px 16px;
    font-size: 16px;
  }
}
</style>
