<script setup lang="ts">
import type { Question } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'
import { computed } from 'vue';

const props = defineProps<{
  question: Question
  answer?: string
}>()

const store = useQuizStore()

const update = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setCustomInput(props.question.id, target.value)
}
const isEmpty = computed(() => {
  return !props.answer || props.answer.trim().length === 0
})
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
        <div class="input-container">
          <input :value="answer" @input="update" type="text" class="main-input" placeholder="Введите стиль" autofocus />
        </div>
      </main>

      <!-- ПОДВАЛ (Навигация) -->
      <footer class="sheet-footer">
        <button type="button" class="nav-btn btn-back" @click="store.prevStep" :disabled="store.currentStep === 0"
          :style="{ opacity: store.currentStep === 0 ? 0.5 : 1, cursor: store.currentStep === 0 ? 'default' : 'pointer' }">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button type="button" class="nav-btn btn-next" :class="{ 'btn-disabled': isEmpty }" :disabled="isEmpty"
          @click="store.nextStep">
          Далее
        </button>
      </footer>

    </div>
  </div>
</template>

<style scoped>
@import '@/assets/quiz_layout.css';

/* =========================================
   1. INPUT CONTAINER
   ========================================= */
.input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px 0;
}

.main-input {
  width: 100%;
  max-width: 700px;
  padding: 24px 32px;
  font-size: 24px;
  border: 3px solid #B3D4F0;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;
  background: #FFFFFF;
  font-family: inherit;
  box-sizing: border-box;
  text-align: center;
}

.main-input::placeholder {
  color: #9CA3AF;
  opacity: 0.7;
}

.main-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

/* =========================================
   2. ANIMATIONS
   ========================================= */
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
   3. АДАПТИВ (ТОЛЬКО ДЛЯ КОМПОНЕНТА)
   ========================================= */
@media (max-width: 1160px) {
  .main-input {
    font-size: 20px;
    padding: 20px 28px;
  }
}

@media (max-width: 768px) {
  .main-input {
    font-size: 18px;
    padding: 18px 24px;
    max-width: 100%;
  }
}

@media (max-width: 374px) {
  .main-input {
    font-size: 16px;
    padding: 14px 18px;
  }
}
</style>