import type { Answers, AnswerValue, FormData, Step, Question } from '@/shared/quiz'
import { defineStore } from 'pinia'

// ✅ Выносим функцию валидации шага ОТДЕЛЬНО от стора
// Она принимает answer и type, возвращает boolean
export const validateStepAnswer = (
  answer: AnswerValue | undefined,
  questionType: string
): boolean => {
  if (!answer) return false

  // Нормализуем тип: slider → range
  const type = questionType === 'slider' ? 'range' : questionType

  switch (type) {
    case 'radio':
      return typeof answer.selected === 'number'
    case 'checkbox':
      return Array.isArray(answer.selected) && answer.selected.length > 0
    case 'range':
      return typeof answer.value === 'number' && !isNaN(answer.value)
    case 'input':
      return !!answer.custom?.trim()
    case 'carousel':
      return typeof answer.selected === 'number'
    default:
      return false
  }
}

export const useQuizStore = defineStore('quiz', {
  state: () => {
    const saved = JSON.parse(localStorage.getItem('quiz') || '{}')
    return {
      steps: [] as Step[],
      currentStep: 0,
      answers: saved.answers || ({} as Answers),
      form: saved.form || ({
        name: '',
        phone: '',
        email: '',
        comment: '',
        agree: false,
      } as FormData),
    }
  },

  getters: {
    currentStepData: (state): Step | undefined => state.steps[state.currentStep],

    // ✅ Валидация формы: используем внешнюю функцию validateStepAnswer
    isFormValid: (state): boolean => {
      // Проверяем только шаги с type: 'question'
      const questionSteps = state.steps.filter((s: Step) => s.type === 'question')
      
      const allAnswered = questionSteps.every((step: Step) => {
        if (!step.question) return false
        const answer = state.answers[step.question.id]
        return validateStepAnswer(answer, step.question.type)
      })
      
      const formFilled = !!(state.form.name?.trim() && state.form.phone?.trim() && state.form.agree)
      return allAnswered && formFilled
    },
  },

  actions: {
    async fetchSteps() {
      try {
        const res = await fetch('https://rendermood.onrender.com/api/steps')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        
        const rawSteps = await res.json() as Step[]

        // ✅ Сортируем по order + нормализуем slider → range
        this.steps = rawSteps
          .sort((a, b) => a.order - b.order)
          .map((step) => {
            if (step.question?.type === 'slider') {
              step.question.type = 'range'
            }
            return step
          })

        console.log('✅ Шаги загружены:', this.steps.map((s) => ({ 
          id: s.id, 
          order: s.order, 
          type: s.question?.type 
        })))
      } catch (error) {
        console.error('❌ Ошибка загрузки шагов:', error)
      }
    },

    setAnswer(questionId: number, value: number) {
      this.answers[questionId] = { selected: value }
      this.save()
    },

    toggleCheckbox(questionId: number, optionId: number) {
      const current = this.answers[questionId]?.selected
      let selected: number[] = Array.isArray(current) ? [...current] : []

      if (selected.includes(optionId)) {
        selected = selected.filter((id) => id !== optionId)
      } else {
        selected.push(optionId)
      }

      this.answers[questionId] = { selected }
      this.save()
    },

    setCustomInput(questionId: number, value: string) {
      this.answers[questionId] = { custom: value }
      this.save()
    },

    setRangeAnswer(questionId: number, value: number) {
      this.answers[questionId] = { value }
      this.save()
    },

    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    setFormField<K extends keyof FormData>(key: K, value: FormData[K]) {
      this.form[key] = value
      this.save()
    },

    async submitForm() {
      if (!this.isFormValid) {
        console.warn('Форма не заполнена')
        return
      }

      const payload = {
        answers: this.answers,
        form: this.form,
      }

      try {
        const res = await fetch('https://rendermood.onrender.com/api/steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          localStorage.removeItem('quiz')
          console.log('✅ Форма отправлена')
        }
      } catch (error) {
        console.error('❌ Ошибка отправки:', error)
      }
    },

    save() {
      localStorage.setItem('quiz', JSON.stringify({
        answers: this.answers,
        form: this.form,
      }))
    },

    clear() {
      localStorage.removeItem('quiz')
      this.$reset()
    },
    
    // ✅ Экшен для валидации конкретного шага (если нужно из компонента)
    validateStep(step: Step): boolean {
      if (step.type === 'form') {
        return !!(this.form.name?.trim() && this.form.phone?.trim() && this.form.agree)
      }
      if (!step.question) return false
      const answer = this.answers[step.question.id]
      return validateStepAnswer(answer, step.question.type)
    },
  },
})