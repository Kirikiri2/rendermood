<!-- components/questions/RadioQuestion.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Question, Option } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'

const props = defineProps<{ question: Question }>()
const store = useQuizStore()
const customValue = ref('')

const isOtherOption = (opt: Option): boolean => {
  const text = opt.text.toLowerCase()
  return text.includes('другое') || text.includes('other') || text.includes('иное')
}

const otherOption = computed(() => props.question.options?.find(isOtherOption))
const currentAnswer = computed(() => store.answers[props.question.id])

const isSelected = (optionId: number): boolean =>
  currentAnswer.value?.selected === optionId

const isOtherSelected = computed(() =>
  otherOption.value ? isSelected(otherOption.value.id) : false
)

watch(() => currentAnswer.value?.custom, (val) => {
  if (val) customValue.value = val
}, { immediate: true })

const selectOption = (optionId: number) => {
  if (otherOption.value && optionId === otherOption.value.id) {
    store.setAnswerWithCustom(props.question.id, optionId, customValue.value)
  } else {
    store.setAnswer(props.question.id, optionId)
    customValue.value = ''
  }
}

const updateCustom = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  customValue.value = val
  store.setCustomInput(props.question.id, val)
}

defineEmits<{ (e: 'complete'): void }>()
</script>

<template>
  <div class="space-y-3">
    <label 
      v-for="option in question.options" 
      :key="option.id"
      class="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded transition"
    >
      <input
        type="radio"
        :name="`question-${question.id}`"
        :value="option.id"
        :checked="isSelected(option.id)"
        @change="selectOption(option.id)"
        class="w-4 h-4 cursor-pointer accent-blue-600"
      />
      <span>{{ option.text }}</span>
    </label>

    <div v-if="isOtherSelected" class="mt-3 pl-6 animate-fadeIn">
      <input
        v-model="customValue"
        @input="updateCustom"
        type="text"
        placeholder="Введите ваш вариант"
        class="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        :class="{ 'border-red-400': isOtherSelected && !customValue.trim() }"
        autofocus
      />
      <p v-if="isOtherSelected && !customValue.trim()" class="text-sm text-red-600 mt-1">
        Пожалуйста, укажите ваш вариант
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeIn { animation: fadeIn 0.2s ease-in; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>