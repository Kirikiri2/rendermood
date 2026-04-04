<script setup lang="ts">
import { useQuizStore } from '@/stores/quizStore'
import type { Question, Option } from '@/shared/quiz'

const props = defineProps<{
  question: Question
}>()

const store = useQuizStore()

// Проверка, выбран ли вариант
const isSelected = (optionId: number): boolean => {
  const answer = store.answers[props.question.id]
  if (!answer?.selected) return false
  const selected = Array.isArray(answer.selected) ? answer.selected : [answer.selected]
  return selected.includes(optionId)
}

// Обработчик клика
const toggle = (option: Option) => {
  console.log(`✅ Чекбокс кликну: Q${props.question.id} → Option ${option.id}`)
  store.toggleCheckbox(props.question.id, option.id)
}
</script>

<template>
  <div class="checkbox-grid">
    <div
      v-for="option in question.options"
      :key="option.id"
      class="checkbox-item"
      :class="{ active: isSelected(option.id) }"
      @click="toggle(option)"
    >
      <!-- Галочка (SVG или Unicode) -->
      <span class="checkbox-icon">{{ isSelected(option.id) ? '☑️' : '⬜' }}</span>
      {{ option.text }}
    </div>
  </div>
</template>

<style scoped>
.checkbox-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.checkbox-item {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.checkbox-item:hover { border-color: #007CDD; }
.checkbox-item.active {
  background: #f0f9ff;
  border-color: #007CDD;
  font-weight: 500;
}
.checkbox-icon { font-size: 1.2rem; }
</style>