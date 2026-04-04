<!-- components/questions/CheckboxQuestion.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Question, Option } from '@/shared/quiz'
import { useQuizStore } from '@/stores/quizStore'

const props = defineProps<{ question: Question }>()
const store = useQuizStore()
const customValue = ref('')

const currentAnswer = computed(() => store.answers[props.question.id] || {})
const selectedIds = computed<number[]>(() =>
  Array.isArray(currentAnswer.value.selected) ? currentAnswer.value.selected : []
)

const isOtherOption = (opt: Option) =>
  opt.text.toLowerCase().includes('другое') || opt.text.toLowerCase().includes('other')

const otherOption = computed(() => props.question.options?.find(isOtherOption))
const isOtherSelected = computed(() =>
  otherOption.value && selectedIds.value.includes(otherOption.value.id)
)

watch(() => currentAnswer.value?.custom, (val) => {
  if (val) customValue.value = val
}, { immediate: true })

const toggleOption = (optionId: number) => {
  store.toggleCheckbox(props.question.id, optionId)
}

const updateCustom = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  customValue.value = val
  store.setCustomInput(props.question.id, val)
}

const isEmpty = computed(() => selectedIds.value.length === 0)
</script>

<template>
  <div class="space-y-3">
    <p v-if="!question.options?.length" class="text-yellow-600 bg-yellow-50 p-3 rounded">
      ⚠️ Опции не загружены
    </p>

    <label 
      v-for="option in question.options" 
      :key="option.id"
      class="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition border border-transparent"
      :class="{ 'bg-yellow-50 border-yellow-200': isEmpty }"
    >
      <input
        type="checkbox"
        :checked="selectedIds.includes(option.id)"
        @change="toggleOption(option.id)"
        class="mt-1 w-4 h-4 cursor-pointer accent-blue-600"
      />
      <div>
        <span class="font-medium">{{ option.text }}</span>
        <span v-if="option.propertyType" class="block text-xs text-gray-400">
          {{ option.propertyType === 'residential' ? 'Жилое' : 'Коммерческое' }}
        </span>
      </div>
    </label>

    <div v-if="isOtherSelected" class="mt-3 pl-2 animate-fadeIn">
      <input
        v-model="customValue"
        @input="updateCustom"
        type="text"
        placeholder="Укажите вашу зону"
        class="border rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2"
        :class="customValue.trim() ? 'border-gray-300 focus:ring-blue-500' : 'border-red-300 focus:ring-red-500'"
        autofocus
      />
      <p v-if="isOtherSelected && !customValue.trim()" class="text-sm text-red-600 mt-1">
        ⚠️ Пожалуйста, укажите название зоны
      </p>
    </div>

    <Transition name="slide">
      <p v-if="isEmpty" class="text-sm text-red-600 mt-2 flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        Выберите хотя бы один вариант
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.animate-fadeIn { animation: fadeIn 0.2s ease-in; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-5px); }
</style>