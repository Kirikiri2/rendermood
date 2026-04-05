<!-- components/questions/CarouselQuestion.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Question } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'
import ProgressBar from '../ProgressBar.vue';

const props = defineProps<{ question: Question }>()
const store = useQuizStore()

const questionId = computed(() => props.question.id)

// 🔒 Безопасное получение опций с проверкой
const options = computed(() => {
  const opts = props.question.options
  return Array.isArray(opts) ? opts : []
})

// Текущий слайд
const currentIndex = ref(0)
const selectedId = ref<number | null>(null)
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)

// Восстановление выбранного значения
onMounted(() => {
  const qId = questionId.value
  const answer = store.answers[qId]

  // 🔒 Проверка: selected существует и это число
  const selected = answer?.selected
  if (typeof selected === 'number') {
    selectedId.value = selected

    // 🔒 Безопасный поиск: проверяем, что опция существует
    const foundIndex = options.value.findIndex((opt) => opt?.id === selected)
    if (foundIndex >= 0) {
      currentIndex.value = foundIndex
    }
  }
})

// Выбор опции
const selectOption = (optionId: number, index: number) => {
  selectedId.value = optionId
  currentIndex.value = index
  store.setAnswer(questionId.value, optionId)
}

// Навигация — с проверкой границ массива
const nextSlide = () => {
  const maxIndex = options.value.length - 1
  if (currentIndex.value < maxIndex && maxIndex >= 0) {
    currentIndex.value++
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const goToSlide = (index: number) => {
  // 🔒 Проверка: индекс в допустимых пределах
  if (index >= 0 && index < options.value.length) {
    currentIndex.value = index
  }
}

// 🖱️ Touch-события
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0]?.clientX ?? 0
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  touchEndX.value = e.touches[0]?.clientX ?? 0
}

const handleTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false

  const diff = touchStartX.value - touchEndX.value
  const threshold = 50

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      nextSlide()
    } else if (diff < 0) {
      prevSlide()
    }
  }
}

// ⌨️ Клавиатура — с полной типобезопасностью
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    prevSlide()
  } else if (e.key === 'ArrowRight') {
    nextSlide()
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    // 🔒 Безопасное получение текущей опции
    const opts = options.value
    const idx = currentIndex.value
    if (idx >= 0 && idx < opts.length) {
      const currentOption = opts[idx]
      if (currentOption?.id !== undefined) {
        selectOption(currentOption.id, idx)
      }
    }
  }
}
const isEmpty = computed(() => selectedId.value === null)
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 🔧 Обработчик ошибки загрузки изображения
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement | null
  if (target && target instanceof HTMLImageElement) {
    target.src = 'https://via.placeholder.com/400x300?text=No+Image'
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
        <ProgressBar />
        <h2 class="sheet-title">{{ question.text }}</h2>
      </header>

      <!-- СКРОЛЛИРУЕМАЯ ЗОНА -->
      <main class="sheet-body">
        <!-- Горизонтальный скролл с фото -->
        <div class="carousel-scroll">
          <div v-for="(option, index) in question.options" :key="option.id" class="carousel-item"
            :class="{ 'carousel-item--selected': option.id === selectedId }" @click="selectOption(option.id, index)">
            <div class="slide-content">
              <!-- Изображение -->
              <div class="image-wrapper">
                <img v-if="option.imageUrl" :src="option.imageUrl" :alt="option.text" class="slide-image"
                  loading="lazy" />
                <div v-else class="slide-placeholder">
                  <span>Нет фото</span>
                </div>

                <!-- Оверлей при выборе -->
                <div class="image-overlay" :class="{ 'image-overlay--selected': option.id === selectedId }"></div>

                <!-- Галочка -->
                <div v-if="option.id === selectedId" class="checkmark">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <!-- Текст -->
              <div class="slide-info">
                <h3 class="slide-title">{{ option.text }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Сообщение об ошибке валидации -->
        <Transition name="slide">
          <p v-if="isEmpty" class="validation-msg">
            <svg class="icon-warn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Выберите один вариант
          </p>
        </Transition>
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
   1. CAROUSEL SCROLL (ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ)
   ========================================= */
.carousel-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 10px 5px 20px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.carousel-scroll::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  flex: 0 0 280px;
  scroll-snap-align: center;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s, transform 0.3s;
}

.carousel-item:hover {
  opacity: 0.8;
  transform: translateY(-4px);
}

.carousel-item--selected {
  opacity: 1;
  transform: scale(1.05);
}

/* Контент слайда */
.slide-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid transparent;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.carousel-item--selected .slide-content {
  border-color: #3B82F6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

/* Изображение */
.image-wrapper {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
  background: #F1F5F9;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.carousel-item--selected .slide-image {
  transform: scale(1.05);
}

.slide-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E2E8F0;
  color: #94A3B8;
  font-size: 16px;
}

/* Оверлей */
.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0);
  transition: background 0.3s;
}

.image-overlay--selected {
  background: rgba(59, 130, 246, 0.15);
}

/* Галочка */
.checkmark {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  background: #3B82F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Информация */
.slide-info {
  padding: 16px;
  text-align: center;
  background: white;
}

.slide-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* =========================================
   2. VALIDATION & ANIMATIONS
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
  width: 20px;
  height: 20px;
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
   3. АДАПТИВ (ТОЛЬКО ДЛЯ КОМПОНЕНТА)
   ========================================= */
@media (max-width: 768px) {
  .carousel-item {
    flex: 0 0 240px;
  }
  .image-wrapper {
    height: 280px;
  }
  .slide-title {
    font-size: 16px;
  }
}

@media (max-width: 374px) {
  .carousel-item {
    flex: 0 0 200px;
  }
  .image-wrapper {
    height: 240px;
  }
  .slide-title {
    font-size: 14px;
  }
}
</style>