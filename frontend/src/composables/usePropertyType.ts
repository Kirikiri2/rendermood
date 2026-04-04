// '@/composables/usePropertyType.ts'
import { computed } from 'vue'
import { useQuizStore } from '@/stores/quizStore'

export const usePropertyType = () => {
  const store = useQuizStore()

  const propertyType = computed(() => {
    const answer = store.answers[1]

    if (!answer) return null

    // Если пользователь выбрал "Другое" и ввёл текст
    if (answer.otherText?.trim()) {
      return 'other' as const
    }

    const selected = answer.selected

    if (selected === 1 || selected === 2) {
      return 'residential' as const
    }

    if (selected === 3) {
      return 'commercial' as const
    }

    return null
  })

  return { propertyType }
}