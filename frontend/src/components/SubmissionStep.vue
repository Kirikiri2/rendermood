<!-- components/SubmissionStep.vue -->
<script setup lang="ts">
import { useQuizStore } from '@/stores/quizStore'

const store = useQuizStore()

// 🔒 Безопасная обработка текстовых полей
const handleInput = (e: Event, key: 'name' | 'phone' | 'email' | 'comment') => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  store.setFormField(key, target.value as string)
}

// 🔒 Безопасная обработка чекбокса
const handleCheckbox = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setFormField('agree', target.checked)
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
        <h2 class="sheet-title">Оставьте контакты, и мы свяжемся с вами по вашему проекту</h2>
      </header>

      <!-- СКРОЛЛИРУЕМАЯ ЗОНА -->
      <main class="sheet-body">
        <div class="form-container">
          <!-- Имя -->
          <div class="form-group">
            <input v-model="store.form.name" @input="handleInput($event, 'name')" type="text" class="form-input"
              placeholder="Имя" />
          </div>

          <!-- Телефон -->
          <div class="form-group">
            <input v-model="store.form.phone" @input="handleInput($event, 'phone')" type="tel" class="form-input"
              placeholder="Номер телефона" />
          </div>

          <!-- Email -->
          <div class="form-group">
            <input v-model="store.form.email" @input="handleInput($event, 'email')" type="email" class="form-input"
              placeholder="Email" />
          </div>

          <!-- Комментарий -->
          <div class="form-group">
            <textarea v-model="store.form.comment" @input="handleInput($event, 'comment')"
              class="form-input form-textarea" placeholder="Коментарий" rows="3" />
          </div>

          <!-- Чекбокс согласия -->
          <label class="checkbox-agreement">
            <input type="checkbox" :checked="store.form.agree"
              @change="(e) => store.setFormField('agree', (e.target as HTMLInputElement).checked)"
              class="agreement-checkbox" />
            <span class="agreement-text">
              Я соглашаюсь на обработку персональных данных
            </span>
          </label>

          <!-- Кнопка отправки -->
          <button type="button" class="submit-btn" @click="store.submitForm">
            Получить консультацию
          </button>
        </div>
      </main>
      <!-- ПОДВАЛ (Навигация) -->
      <footer class="sheet-footer">
        <button type="button" class="nav-btn btn-back" @click="store.prevStep">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <!-- Пустой блок для баланса -->
        <div style="width: 100px;"></div>
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
  width: 95vw;
  max-width: 1050px;
  height: 85vh;
  min-height: 600px;
  max-height: 750px;
  background: #FFFFFF;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  z-index: 1;
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
  border-radius: 8px;
  transform: translate(20px, 20px);
  z-index: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

/* =========================================
   4. HEADER
   ========================================= */
.sheet-header {
  border-radius: 8px 8px 0 0;
  z-index: 1;
  padding: 40px 50px 15px;
  position: relative;
  flex-shrink: 0;
  background: #FFFFFF;
}

.progress-bar {
  position: absolute;
  top: 20px;
  left: 50px;
  width: 750px;
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
   5. BODY (БЕЗ СКРОЛЛА - всё помещается)
   ========================================= */
.sheet-body {
  z-index: 1;
  flex: 1;
  overflow: visible;
  /* ✅ Убираем скролл контейнера */
  padding: 20px 50px 20px;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
}

/* =========================================
   6. FORM CONTAINER
   ========================================= */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* ✅ Уменьшили gap */
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.form-group {
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  /* ✅ Чуть меньше padding */
  font-size: 17px;
  border: 2px solid #B3D4F0;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
  background: #FFFFFF;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #3B82F6;
  opacity: 0.8;
}

.form-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* ✅ ТЕКСТОВОЕ ПОЛЕ - СКРОЛЛИТСЯ ВНУТРИ */
.form-textarea {
  resize: none;
  /* Запрещаем ручное изменение размера */
  height: 80px;
  /* Фиксированная высота */
  overflow-y: auto;
  /* ✅ Включаем скролл только внутри textarea */
  max-height: 120px;
  /* Максимальная высота перед скроллом */
}

.form-textarea::-webkit-scrollbar {
  width: 6px;
}

.form-textarea::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 3px;
}

.form-textarea::-webkit-scrollbar-thumb {
  background-color: #CBD5E1;
  border-radius: 3px;
}

/* =========================================
   7. CHECKBOX AGREEMENT
   ========================================= */
.checkbox-agreement {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  margin-top: 4px;
}

.agreement-checkbox {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #3B82F6;
  flex-shrink: 0;
}

.agreement-text {
  font-size: 14px;
  color: #9CA3AF;
  line-height: 1.4;
}

/* =========================================
   8. SUBMIT BUTTON
   ========================================= */
.submit-btn {
  margin-top: 12px;
  /* ✅ Уменьшили отступ */
  padding: 16px 60px;
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  background: #0073E6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 115, 230, 0.3);
}

.submit-btn:hover {
  background: #005BB5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 115, 230, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

/* =========================================
   9. FOOTER
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

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* =========================================
   10. ANIMATIONS
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

  .progress-bar {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .quiz-sheet {
    height: 100vh;
    width: 100vw;
    border-radius: 0;
    max-height: none;
  }

  .quiz-sheet__shadow-layer {
    display: none;
  }

  .sheet-header {
    padding: 25px 20px 10px;
  }

  .sheet-title {
    font-size: 22px;
  }

  .progress-bar {
    left: 20px;
    width: 150px !important;
  }

  .sheet-body {
    padding: 15px 20px 15px;
  }

  .form-container {
    gap: 10px;
  }

  .form-input {
    padding: 12px 16px;
    font-size: 16px;
  }

  .form-textarea {
    height: 60px;
    max-height: 100px;
  }

  .checkbox-agreement {
    margin-top: 0;
  }

  .agreement-text {
    font-size: 13px;
  }

  .submit-btn {
    width: 100%;
    padding: 14px;
    margin-top: 8px;
  }

  .sheet-footer {
    padding: 0 20px;
    height: 70px;
  }

  .nav-btn {
    font-size: 17px;
    padding: 8px 14px;
  }
}

@media (max-width: 374px) {
  .sheet-header {
    padding: 20px 15px 10px;
  }

  .sheet-title {
    font-size: 18px;
  }

  .sheet-body {
    padding: 10px 15px 10px;
  }

  .form-input {
    padding: 10px 14px;
    font-size: 15px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 16px;
  }

  .sheet-footer {
    padding: 0 15px;
    height: 60px;
  }

  .nav-btn {
    font-size: 15px;
    padding: 6px 12px;
  }
}
</style>