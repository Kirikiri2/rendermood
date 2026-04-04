<!-- components/questions/CarouselQuestion.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Question } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'

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
  <div class="carousel-question">
    <p class="question-text">{{ question.text }}</p>

    <div
      class="carousel-container"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Кнопка назад -->
      <button
        @click="prevSlide"
        :disabled="currentIndex === 0"
        class="carousel-btn carousel-btn--prev"
        aria-label="Предыдущий стиль"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- Слайды -->
      <div class="carousel-slides">
        <div
          v-for="(option, index) in options"
          :key="option.id"
          class="carousel-slide"
          :class="{
            'carousel-slide--active': index === currentIndex,
            'carousel-slide--selected': option.id === selectedId,
          }"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            class="slide-content"
            @click="selectOption(option.id, index)"
            :tabindex="0"
            role="radio"
            :aria-checked="option.id === selectedId"
            @keydown.enter="selectOption(option.id, index)"
            @keydown.space.prevent="selectOption(option.id, index)"
          >
            <!-- Изображение -->
            <div class="image-wrapper">
              <img
                :src="option.imageUrl || undefined"
                :alt="option.text"
                class="slide-image"
                loading="lazy"
                @error="handleImageError"
              />
              <div
                class="image-overlay"
                :class="{ 'image-overlay--selected': option.id === selectedId }"
              ></div>

              <!-- Галочка выбора -->
              <div v-if="option.id === selectedId" class="checkmark">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
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

      <!-- Кнопка вперёд -->
      <button
        @click="nextSlide"
        :disabled="currentIndex === options.length - 1"
        class="carousel-btn carousel-btn--next"
        aria-label="Следующий стиль"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Индикаторы слайдов -->
    <div class="carousel-indicators">
      <button
        v-for="(option, index) in options"
        :key="option.id"
        @click="goToSlide(index)"
        class="indicator"
        :class="{ 'indicator--active': index === currentIndex }"
        :aria-label="`Перейти к слайду ${index + 1}`"
      >
        <span class="indicator-dot"></span>
      </button>
    </div>

    <!-- Счётчик слайдов -->
    <div class="slide-counter">{{ currentIndex + 1 }} / {{ options.length }}</div>

    <!-- Подсказка -->
    <p class="carousel-hint">👆 Нажмите на карточку или используйте стрелки ← → для навигации</p>
  </div>
</template>

<style scoped>
.carousel-question {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.question-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

/* Контейнер карусели */
.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: #f9fafb;
}

/* Кнопки навигации */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carousel-btn:hover:not(:disabled) {
  background: #007cdd;
  border-color: #007cdd;
  color: white;
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-btn--prev {
  left: 12px;
}
.carousel-btn--next {
  right: 12px;
}

/* Слайды */
.carousel-slides {
  display: flex;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.carousel-slide {
  min-width: 100%;
  padding: 16px;
  box-sizing: border-box;
  opacity: 0.6;
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.carousel-slide--active {
  opacity: 1;
  transform: scale(1);
}

/* Контент слайда */
.slide-content {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  border: 3px solid transparent;
  transition: all 0.3s;
  outline: none;
}

.slide-content:focus-visible {
  border-color: #007cdd;
  box-shadow: 0 0 0 4px rgba(0, 124, 221, 0.2);
}

.slide-content:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.carousel-slide--selected .slide-content {
  border-color: #007cdd;
  box-shadow: 0 8px 24px rgba(0, 124, 221, 0.2);
}

/* Изображение */
.image-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.slide-content:hover .slide-image {
  transform: scale(1.05);
}

.carousel-slide--selected .slide-image {
  transform: scale(1.08);
}

/* Оверлей */
.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s;
}

.carousel-slide--selected .image-overlay--selected {
  background: rgba(0, 124, 221, 0.15);
}

/* Галочка */
.checkmark {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  background: #007cdd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 124, 221, 0.4);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Информация */
.slide-info {
  padding: 16px;
  text-align: center;
  background: white;
}

.slide-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Индикаторы */
.carousel-indicators {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.indicator {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.indicator:hover {
  background: rgba(0, 124, 221, 0.1);
}

.indicator-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d1d5db;
  transition: all 0.3s;
}

.indicator--active .indicator-dot {
  background: #007cdd;
  transform: scale(1.3);
}

/* Счётчик */
.slide-counter {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Подсказка */
.carousel-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
  margin-top: 4px;
}

/* 📱 Адаптив */
@media (max-width: 640px) {
  .image-wrapper {
    height: 220px;
  }
  .carousel-btn {
    width: 36px;
    height: 36px;
  }
  .carousel-btn--prev {
    left: 8px;
  }
  .carousel-btn--next {
    right: 8px;
  }
  .slide-title {
    font-size: 1.125rem;
  }
  .checkmark {
    width: 40px;
    height: 40px;
  }
}

/* 🖥️ Десктоп */
@media (min-width: 768px) {
  .carousel-slides {
    gap: 16px;
  }
  .carousel-slide {
    min-width: calc(50% - 8px);
  }
  .image-wrapper {
    height: 320px;
  }
}

@media (min-width: 1024px) {
  .carousel-slide {
    min-width: calc(33.333% - 11px);
  }
  .image-wrapper {
    height: 360px;
  }
}
</style>
