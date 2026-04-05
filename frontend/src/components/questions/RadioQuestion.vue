<!-- components/questions/RadioQuestion.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Question, Option } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'

const props = defineProps<{ question: Question }>()
const store = useQuizStore()
const customValue = ref('')

const isOtherOption = (opt: Option): boolean => {
  const text = opt.text.toLowerCase()
  return text.includes('другое') || text.includes('other') || text.includes('иное')
}

const otherOption = computed(() => props.question.options?.find(isOtherOption))
const currentAnswer = computed(() => store.answers[props.question.id])

const isSelected = (optionId: number): boolean => currentAnswer.value?.selected === optionId

const isOtherSelected = computed(() =>
  otherOption.value ? isSelected(otherOption.value.id) : false,
)

watch(
  () => currentAnswer.value?.custom,
  (val) => {
    if (val) customValue.value = val
  },
  { immediate: true },
)

const selectOption = (optionId: number) => {
  if (otherOption.value && optionId === otherOption.value.id) {
    store.setAnswerWithCustom(props.question.id, optionId, customValue.value)
  } else {
    store.setAnswer(props.question.id, optionId)
    customValue.value = ''
  }
}

const updateCustom = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  customValue.value = val
  store.setCustomInput(props.question.id, val)
}
const isEmpty = computed(() => currentAnswer.value?.selected === undefined)

defineEmits<{ (e: 'complete'): void }>()
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
        <div class="options-grid">
          <label
            v-for="option in question.options"
            :key="option.id"
            class="option-card"
            :class="[
              { 'is-selected': isSelected(option.id) },
              { 'is-invalid': isEmpty && !isSelected(option.id) },
              { 'is-full-width': isOtherOption(option) },
            ]"
          >
            <input
              type="radio"
              :name="`question-${question.id}`"
              :value="option.id"
              :checked="isSelected(option.id)"
              @change="selectOption(option.id)"
              class="hidden-radio"
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
            placeholder="Введите ваш вариант"
            class="modern-input"
            :class="{ 'input-error': !customValue.trim() }"
            autofocus
          />
          <p v-if="isOtherSelected && !customValue.trim()" class="error-text">
            Пожалуйста, укажите ваш вариант
          </p>
        </div>

        <!-- Сообщение об ошибке валидации -->
        <Transition name="slide">
          <p v-if="isEmpty" class="validation-msg">
            <svg class="icon-warn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Выберите один вариант
          </p>
        </Transition>
      </main>

      <!-- ПОДВАЛ (Навигация) -->
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
/* =========================================
   1. OVERLAY
   ========================================= */
.quiz-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
   2. SHEET (Бланк)
   ========================================= */
.quiz-sheet {
  position: relative;
  width: 95vw;
  max-width: 1050px;
  height: 80vh;
  min-height: 450px;
  max-height: 705px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  z-index: 1;
  /* Убираем жесткий сдвиг для лучшей адаптивности */
}

/* =========================================
   3. SHADOW LAYER (Подложка)
   ========================================= */
.quiz-sheet__shadow-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #b3d4f0;
  border-radius: 8px;
  transform: translate(20px, 20px);
  z-index: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

/* =========================================
   4. HEADER
   ========================================= */
.sheet-header {
  border-radius: 5px 5px 0 0;
  z-index: 1;
  padding: 40px 50px 40px;
  position: relative;
  flex-shrink: 0;
  background: #ffffff;
}

.progress-bar {
  position: absolute;
  top: 20px;
  left: 50px;
  width: 150px;
  height: 6px;
  background: #3b82f6;
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
   5. BODY
   ========================================= */
.sheet-body {
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 10px 50px 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #ffffff;

  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.sheet-body::-webkit-scrollbar {
  width: 8px;
}
.sheet-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.sheet-body::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 4px;
}

/* =========================================
   6. GRID
   ========================================= */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}

/* =========================================
   7. CARD
   ========================================= */
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

.option-card.is-invalid {
  background-color: #fef3c7;
  border-color: #f59e0b;
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

.hidden-radio {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* =========================================
   8. INPUT "ДРУГОЕ"
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
   9. FOOTER
   ========================================= */
.sheet-footer {
  border-radius: 0 0 5px 5px;
  z-index: 1;
  height: 80px;
  background-color: #f0f9ff;
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

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-btn.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #9ca3af;
}
.nav-btn.btn-disabled:hover {
  background: none;
}

.btn-back {
  font-size: 24px;
}

/* =========================================
   10. UTILS & ANIMATIONS
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
   АДАПТИВ
   ========================================= */
@media (max-width: 1160px) {
  .quiz-sheet {
    width: 95vw;
    height: 85vh;
    max-width: 1100px;
  }
}

@media (max-width: 768px) {
  .quiz-sheet {
    height: 95vh;
    width: 100vw;
    border-radius: 0;
  }
  .quiz-sheet__shadow-layer {
    display: none;
  }
  .sheet-header {
    padding: 30px 20px 15px;
  }
  .sheet-title {
    font-size: 24px;
  }
  .sheet-body {
    padding: 10px 20px 20px;
  }
  .options-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .option-card {
    padding: 16px;
    min-height: 50px;
  }
  .sheet-footer {
    padding: 0 20px;
    height: 70px;
  }
}
</style>
