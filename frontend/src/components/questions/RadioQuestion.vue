<script setup lang="ts">
import type { Question, Option } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  question: Question
}>()

const store = useQuizStore()
const otherInput = ref('')

const otherOption = computed(() =>
  props.question.options.find((opt: Option) => opt.isOther === true),
)

const selectedId = computed(() => store.answers[props.question.id]?.selected as number | undefined)

const showOtherInput = computed(() => {
  if (!otherOption.value) return false
  return selectedId.value === otherOption.value.id
})

// Синхронизация текста при загрузке
watch(
  () => store.answers[props.question.id]?.otherText,
  (val) => {
    otherInput.value = val || ''
  },
  { immediate: true },
)

const selectOption = (optionId: number) => {
  store.setAnswer(props.question.id, optionId)

  setTimeout(() => {
    store.nextStep()
  }, 300)
}

const saveOtherText = () => {
  if (!otherInput.value.trim() || !otherOption.value) return

  store.setAnswer(props.question.id, otherOption.value.id)
  store.setCustomInput(props.question.id, otherInput.value.trim())
}
</script>

<template>
  <div class="radio-question">
    <div
      v-for="opt in question.options"
      :key="opt.id"
      class="radio-option"
      :class="{ selected: selectedId === opt.id }"
      @click="selectOption(opt.id)"
    >
      {{ opt.text }}
    </div>

    <div v-if="showOtherInput" class="other-input-container">
      <input
        v-model="otherInput"
        placeholder="Укажите, какое именно помещение..."
        @blur="saveOtherText"
        @keyup.enter="saveOtherText"
        class="other-input"
      />
      <small v-if="!otherInput.trim()" class="error-text">
        Пожалуйста, уточните тип помещения
      </small>
    </div>
  </div>
</template>

<style scoped>
.radio-option {
  padding: 14px 16px;
  margin-bottom: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-option:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.radio-option.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
  font-weight: 500;
}

.other-input-container {
  margin-top: 12px;
}

.other-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  font-size: 1rem;
}

.other-input:focus {
  border-color: #2563eb;
}

.error-text {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 4px;
}
</style>
