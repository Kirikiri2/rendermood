<!-- components/SubmissionStep.vue -->
<script setup lang="ts">
import { useQuizStore } from '@/stores/quizStore'

const store = useQuizStore()

// 🔒 Безопасная обработка текстовых полей
const handleInput = (e: Event, key: 'name' | 'phone' | 'email' | 'comment') => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  store.setFormField(key, target.value as string)
}

const handleCheckbox = (e: Event) => {
  const target = e.target as HTMLInputElement
  store.setFormField('consent', target.checked)
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
            <input type="checkbox" :checked="store.form.consent" @change="handleCheckbox" />
            <span class="agreement-text">
              Я соглашаюсь на обработку персональных данных
            </span>
          </label>

          <!-- Кнопка отправки -->
          <button type="button" class="submit-btn" @click="store.submitQuiz">
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
@import '@/assets/quiz_layout.css';

/* =========================================
   1. FORM CONTAINER
   ========================================= */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  height: 80px;
  overflow-y: auto;
  max-height: 120px;
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
   2. CHECKBOX AGREEMENT
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
   3. SUBMIT BUTTON
   ========================================= */
.submit-btn {
  margin-top: 12px;
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
   4. АДАПТИВ (ОСТАВЛЯЕМ ТОЛЬКО СПЕЦИФИЧНЫЕ ПРАВКИ)
   ========================================= */

@media (max-width: 768px) {
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
}

@media (max-width: 374px) {
  .form-input {
    padding: 10px 14px;
    font-size: 15px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 16px;
  }
}
</style>