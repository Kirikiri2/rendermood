import type { Answers, AnswerValue, Step } from '@/shared/quiz'
import { defineStore } from 'pinia'

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    steps: [] as Step[],
    currentStep: 0,
    answers: JSON.parse(localStorage.getItem('answers') || '{}') as Answers,
  }),

  getters: {
    currentStepData: (state): Step | undefined => state.steps[state.currentStep],
  },

  actions: {
    async fetchSteps() {
      const res = await fetch('https://rendermood.onrender.com/api/steps')
      this.steps = await res.json()
      console.log(this.steps)
    },

    setAnswer(questionId: number, value: number | string) {
      if (typeof value === 'number') {
        this.answers[questionId] = { selected: value }
      } else {
        this.answers[questionId] = { custom: value }
      }

      // Пример: если первый шаг изменился, очищаем второй
      if (questionId === 1) delete this.answers[2]

      this.save()
    },

    toggleCheckbox(questionId: number, optionId: number) {
      const current: AnswerValue = this.answers[questionId] || {}
      let selected: number[] = []

      if (current.selected) {
        selected = Array.isArray(current.selected) ? current.selected : [current.selected]
      }

      if (selected.includes(optionId)) {
        selected = selected.filter((id) => id !== optionId)
      } else {
        selected.push(optionId)
      }

      this.answers[questionId] = { ...current, selected }
      this.save()
    },

    setCustomInput(questionId: number, value: string) {
      const current: AnswerValue = this.answers[questionId] || {}
      this.answers[questionId] = { ...current, custom: value }
      this.save()
    },

    setRangeAnswer(questionId: number, value: number) {
      const current: AnswerValue = this.answers[questionId] || {}
      this.answers[questionId] = { ...current, value }
      this.save()
    },

    nextStep() {
      this.currentStep++
    },

    prevStep() {
      this.currentStep--
    },

    save() {
      localStorage.setItem('answers', JSON.stringify(this.answers))
    },
  },
})
