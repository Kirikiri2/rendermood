import type { Answers, AnswerValue, Step } from '@/shared/quiz'
import { defineStore } from 'pinia'


export const useQuizStore = defineStore('quiz', {
  state: () => ({
    steps: [] as Step[],
    currentStep: 0,
    answers: JSON.parse(localStorage.getItem('answers') || '{}') as Answers
  }),

  getters: {
    currentStepData: (state): Step | undefined =>
      state.steps[state.currentStep]
  },

  actions: {
    async fetchSteps() {
      const res = await fetch('http://localhost:3000/api/steps')
      this.steps = await res.json()
    },

    setAnswer(questionId: number, value: AnswerValue) {
      this.answers[questionId] = value
      this.save()
    },

    toggleCheckbox(questionId: number, optionId: number) {
      const current = this.answers[questionId]

      if (!Array.isArray(current)) {
        this.answers[questionId] = [optionId]
      } else {
        if (current.includes(optionId)) {
          this.answers[questionId] = current.filter(id => id !== optionId)
        } else {
          current.push(optionId)
        }
      }

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
    }
  }
})