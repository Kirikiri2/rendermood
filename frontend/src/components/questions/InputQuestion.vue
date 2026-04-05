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
   2. SHEET
   ========================================= */
.quiz-sheet {
  position: relative;
  width: 1050px;
  height: 705px;
  background: #FFFFFF;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  z-index: 1;
  transform: translateY(-20px);
}

/* =========================================
   3. SHADOW LAYER
   ========================================= */
.quiz-sheet__shadow-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #B3D4F0;
  border-radius: 5px;
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
  padding: 40px 50px 20px;
  position: relative;
  flex-shrink: 0;
  background: #FFFFFF;
}

.progress-bar {
  position: absolute;
  top: 20px;
  left: 50px;
  width: 600px;
  height: 6px;
  background: #3B82F6;
  border-radius: 2px 2px 2px 2px;
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
  padding: 40px 50px 30px;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;

  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 #F1F5F9;
}

.sheet-body::-webkit-scrollbar {
  width: 8px;
}

.sheet-body::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 4px;
}

.sheet-body::-webkit-scrollbar-thumb {
  background-color: #94A3B8;
  border-radius: 4px;
}

/* =========================================
   6. INPUT CONTAINER (Центрирование)
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
   7. FOOTER
   ========================================= */
.sheet-footer {
  border-radius: 0 0 5px 5px;
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

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-btn.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #9CA3AF;
}

.nav-btn.btn-disabled:hover {
  background: none;
}

/* =========================================
   8. ANIMATIONS
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
   АДАПТИВ
   ========================================= */
@media (max-width: 1160px) {
  .quiz-sheet {
    width: 95vw;
    height: auto;
    max-height: 90vh;
    max-width: 1100px;
  }

  .sheet-title {
    font-size: 26px;
  }

  .main-input {
    font-size: 20px;
    padding: 20px 28px;
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
    font-size: 22px;
  }

  .progress-bar {
    left: 20px;
    width: 150px !important;
  }

  .sheet-body {
    padding: 30px 20px;
  }

  .main-input {
    font-size: 18px;
    padding: 18px 24px;
    max-width: 100%;
  }

  .sheet-footer {
    padding: 0 20px;
    height: 70px;
  }

  .nav-btn {
    font-size: 18px;
    padding: 8px 16px;
  }
}
</style>
