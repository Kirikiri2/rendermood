<!-- components/questions/CheckboxQuestion.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Question, Option } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'

const props = defineProps<{ question: Question }>()
const store = useQuizStore()
const customValue = ref('')

// 🔍 Ответ с шага 1 (тип объекта)
const firstStepAnswer = computed(() => store.answers[1])
const selectedPropertyType = computed<'residential' | 'commercial' | null>(() => {
  const ans = firstStepAnswer.value
  if (!ans?.selected) return null
  
  // Находим выбранную опцию и её propertyType
  const step1 = store.steps.find(s => s.question?.id === 1)?.question
  const selectedOpt = step1?.options?.find(o => o.id === ans.selected)
  return selectedOpt?.propertyType ?? null
})

// Текущий ответ на этот вопрос
const currentAnswer = computed(() => store.answers[props.question.id] || {})
const selectedIds = computed<number[]>(() =>
  Array.isArray(currentAnswer.value.selected) ? currentAnswer.value.selected : []
)

// 🔍 Опция "Другое"
const isOtherOption = (opt: Option) =>
  opt.text.toLowerCase().includes('другое') || opt.text.toLowerCase().includes('other')

const otherOption = computed(() => props.question.options?.find(isOtherOption))
const isOtherSelected = computed(() =>
  otherOption.value && selectedIds.value.includes(otherOption.value.id)
)

// 🎯 Фильтрация опций по propertyType
const visibleOptions = computed(() => {
  const options = props.question.options || []
  
  // Если тип объекта не определён или выбрано "Другое" → показываем всё
  if (!selectedPropertyType.value) {
    return options
  }
  
  // Фильтруем: показываем совпадающие по типу + опции без типа (универсальные)
  return options.filter(opt => 
    opt.propertyType === selectedPropertyType.value || !opt.propertyType
  )
})

// Восстановление кастомного значения
watch(() => currentAnswer.value?.custom, (val) => {
  if (val) customValue.value = val
}, { immediate: true })

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

// Валидация: пусто ли
const isEmpty = computed(() => selectedIds.value.length === 0)

// 🔍 Отладка (можно убрать в продакшене)
// console.log(`[Checkbox Q${props.question.id}] Тип объекта:`, selectedPropertyType.value)
// console.log(`[Checkbox Q${props.question.id}] Видимо опций:`, visibleOptions.value.length)
</script>




<template>
  <!-- 1. ЗАТЕМНЕННЫЙ ФОН (Оверлей) -->
  <div class="quiz-overlay">
    
    <!-- 2. БЛАНК (1200px x 770px) -->
    <div class="quiz-sheet">
      
      <!-- ЭФФЕКТ ДВОЙНОЙ КАРТОЧКИ (Светло-голубая подложка сзади) -->
      <div class="quiz-sheet__shadow-layer"></div>
      
      <!-- ВЕРХНЯЯ ЧАСТЬ (Заголовок + прогресс-бар) -->
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
              { 'is-selected': selectedIds.includes(option.id) },
              { 'is-invalid': isEmpty },
              { 'is-full-width': isOtherOption(option) }
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

        <!-- Блок "Другое" (если выбран) -->
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
          <p v-if="!customValue.trim()" class="error-text">
            ⚠️ Пожалуйста, укажите название зоны
          </p>
        </div>

        <!-- Сообщение об ошибке валидации -->
        <Transition name="slide">
          <p v-if="isEmpty" class="validation-msg">
            <svg class="icon-warn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Выберите хотя бы один вариант
          </p>
        </Transition>
      </main>

      <!-- ПОДВАЛ (Навигация) -->
      <footer class="sheet-footer">
        <!-- Кнопка НАЗАД -->
        <button 
          type="button" 
          class="nav-btn btn-back"
          @click="store.prevStep"
          :disabled="store.currentStep === 0" 
          :style="{ opacity: store.currentStep === 0 ? 0.5 : 1, cursor: store.currentStep === 0 ? 'default' : 'pointer' }"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <!-- Кнопка ДАЛЕЕ -->
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
   1. OVERLAY (Затемнение фона)
   ========================================= */
.quiz-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* Чуть светлее, чтобы подложка была видна */
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

/* =========================================
   2. SHEET (УМЕНЬШЕННЫЙ БЛАНК)
   ========================================= */
.quiz-sheet {
  position: relative;
  width: 1050px; 
  height: 705px; 
  background: #FFFFFF;
  border-radius: 5px; /* Твой радиус */
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  z-index: 1;
  transform: translateY(-20px);
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
  background: #B3D4F0;
  border-radius: 5px; /* Твой радиус */
  transform: translate(20px, 20px); /* Твое смещение */
  z-index: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
/* =========================================
   4. HEADER (Шапка)
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
  top: 20px; left: 50px;
  width: 200px;
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
   5. BODY (Скроллируемая область)
   ========================================= */
.sheet-body {
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 10px 50px 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
   6. GRID (Сетка вариантов 2 колонки)
   ========================================= */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .options-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .options-grid { grid-template-columns: 1fr; }
}

/* =========================================
   7. CARD (Карточка варианта)
   ========================================= */
.option-card {
  position: relative;
  background-color: #F0F7FF;
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
  background-color: #E1EEFF;
  transform: translateY(-2px);
}

.option-card.is-selected {
  background-color: #3B82F6;
  color: #FFFFFF;
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
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
  background: #F8FAFC;
}

.modern-input:focus {
  border-color: #3B82F6;
  background: #FFFFFF;
}

.modern-input.input-error {
  border-color: #EF4444;
  background: #FEF2F2;
}

.error-text {
  color: #EF4444;
  font-size: 14px;
  margin-top: 8px;
}

/* =========================================
   9. FOOTER (Подвал)
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

.btn-next {
  color: #111827;
}

.btn-back {
  font-size: 24px;
}

/* =========================================
   10. UTILS & ANIMATIONS
   ========================================= */
.validation-msg {
  color: #EF4444;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.icon-warn {
  width: 20px; height: 20px;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 1160px) {
  .quiz-sheet {
    width: 95vw; /* Занимает 95% ширины экрана */
    height: 85vh; /* Чуть ниже, чтобы влезть */
    max-width: 1100px;
  }
  
  .options-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 колонки на планшетах */
  }
}

@media (max-width: 768px) {
  .quiz-sheet {
    height: 95vh; /* Почти на весь экран на мобильных */
    width: 100vw;
    border-radius: 0;
  }
  
  .quiz-sheet__shadow-layer {
    display: none; /* Убираем тень на мобильных для производительности и места */
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
    grid-template-columns: 1fr; /* 1 колонка на телефонах */
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