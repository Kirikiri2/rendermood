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
            <input
              v-model="store.form.name"
              @input="handleInput($event, 'name')"
              type="text"
              class="form-input"
              placeholder="Имя"
            />
          </div>

          <!-- Телефон -->
          <div class="form-group">
            <input
              v-model="store.form.phone"
              @input="handleInput($event, 'phone')"
              type="tel"
              class="form-input"
              placeholder="Номер телефона"
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <input
              v-model="store.form.email"
              @input="handleInput($event, 'email')"
              type="email"
              class="form-input"
              placeholder="Email"
            />
          </div>

          <!-- Комментарий -->
          <div class="form-group">
            <textarea
              v-model="store.form.comment"
              @input="handleInput($event, 'comment')"
              class="form-input form-textarea"
              placeholder="Коментарий"
              rows="3"
            />
          </div>

          <!-- Чекбокс согласия -->
          <label class="checkbox-agreement">
            <input
              v-model="store.form.agree"
              @change="handleCheckbox($event)"
              type="checkbox"
              class="agreement-checkbox"
            />
            <span class="agreement-text">
              Я соглашаюсь на обработку персональных данных
            </span>
          </label>

          <!-- Кнопка отправки -->
          <button 
            type="button" 
            class="submit-btn"
            @click="store.submitForm"
          >
            Получить консультацию
          </button>
        </div>
      </main>
      <!-- ПОДВАЛ (Навигация) -->
      <footer class="sheet-footer">
        <button 
          type="button" 
          class="nav-btn btn-back"
          @click="store.prevStep"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
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
   2. SHEET (Бланк)
   ========================================= */
.quiz-sheet {
  position: relative;
  width: 95vw;
  max-width: 1050px;
  height: 80vh;
  min-height: 450px;
  max-height: 705px;
  background: #FFFFFF;
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
  top: 0; left: 0;
  width: 100%; height: 100%;
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
  border-radius: 5px 5px 0 0;
  z-index: 1;
  padding: 40px 50px 40px;
  position: relative;
  flex-shrink: 0;
  background: #FFFFFF;
}

.progress-bar {
  position: absolute;
  top: 20px; left: 50px;
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

.sheet-body::-webkit-scrollbar { width: 8px; }
.sheet-body::-webkit-scrollbar-track { background: #F1F5F9; border-radius: 4px; }
.sheet-body::-webkit-scrollbar-thumb { background-color: #94A3B8; border-radius: 4px; }

/* =========================================
   6. FORM CONTAINER
   ========================================= */
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.form-group {
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 18px;
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

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* =========================================
   7. CHECKBOX AGREEMENT
   ========================================= */
.checkbox-agreement {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  margin-top: 8px;
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
  margin-top: 20px;
  padding: 18px 60px;
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

.nav-btn:hover { background: rgba(0, 0, 0, 0.05); }

/* =========================================
   10. ANIMATIONS
   ========================================= */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }

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
  
  .sheet-title { font-size: 26px; }
}

@media (max-width: 768px) {
  .quiz-sheet {
    height: 95vh;
    width: 100vw;
    border-radius: 0;
  }
  
  .quiz-sheet__shadow-layer { display: none; }
  .sheet-header { padding: 30px 20px 15px; }
  .sheet-title { font-size: 22px; }
  .progress-bar { left: 20px; width: 150px !important; }
  .sheet-body { padding: 20px; }
  .form-input { padding: 14px 16px; font-size: 16px; }
  .submit-btn { width: 100%; padding: 16px; }
  .sheet-footer { padding: 0 20px; height: 70px; }
}
</style>