<script setup lang="ts">
import type { Question, Option, AnswerValue } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'
import { stepConfig } from '@/config/stepConfig'
import { usePropertyType } from '@/composables/usePropertyType'
import { computed } from 'vue'
import { zoneGroups } from '@/config/zoneConfig'

const props = defineProps<{
  question: Question
  answer?: AnswerValue 
}>()

const store = useQuizStore()
const { propertyType } = usePropertyType()

// Конфигурация текущего шага
const config = computed(() => stepConfig[props.question.stepId] ?? {})

// Минимальное количество выбранных вариантов
const minSelected = computed(() => config.value.minSelected ?? 1)

// Фильтрация опций (особенно важно для шага 2 — по типу помещения)
const filteredOptions = computed(() => {
  if (props.question.stepId !== 2) {
    return props.question.options
  }

  const type = propertyType.value

  if (type === 'other') {
    return props.question.options          // показываем все варианты
  }

  if (type === 'residential') {
    const allowedIds = zoneGroups.residential || zoneGroups['residential']
    return props.question.options.filter((opt: Option) => allowedIds.includes(opt.id))
  }

  if (type === 'commercial') {
    const allowedIds = zoneGroups.commercial || zoneGroups['commercial']
    return props.question.options.filter((opt: Option) => allowedIds.includes(opt.id))
  }

  return props.question.options
})

// Текущие выбранные значения (всегда массив)
const selectedOptions = computed<number[]>(() => {
  const value = store.answers[props.question.id]?.selected
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
})

// Валидация
const isValid = computed(() => selectedOptions.value.length >= minSelected.value)

// Проверка, выбран ли конкретный вариант
const isSelected = (id: number): boolean => selectedOptions.value.includes(id)

// Переключение выбора
const toggleOption = (id: number) => {
  store.toggleCheckbox(props.question.id, id)
}
</script>

<template>
  <div class="checkbox-question">
    <div
      v-for="opt in filteredOptions"
      :key="opt.id"
      class="option-card"
      :class="{ selected: isSelected(opt.id) }"
      @click="toggleOption(opt.id)"
    >
      {{ opt.text }}
    </div>

    <!-- Сообщение об ошибке валидации -->
    <div v-if="!isValid" class="error-message">
      Выберите минимум {{ minSelected }} вариант{{ minSelected > 1 ? 'а' : '' }}
    </div>
  </div>
</template>

<style scoped>
.checkbox-question {
  margin-bottom: 16px;
}

.option-card {
  padding: 14px 16px;
  margin-bottom: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.option-card:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.option-card.selected {
  border-color: #4ade80;
  background-color: #f0fdf4;
  font-weight: 500;
}

.error-message {
  color: #ef4444;
  font-size: 0.95rem;
  margin-top: 8px;
  padding-left: 4px;
}
</style>
