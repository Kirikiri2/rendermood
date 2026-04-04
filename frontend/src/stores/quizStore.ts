// stores/quizStore.ts
import type { Answers, AnswerValue, FormData, Step, Question, Option } from '@/shared/quiz'
import { defineStore } from 'pinia'

export const useQuizStore = defineStore('quiz', {
  state: () => {
    const saved = JSON.parse(localStorage.getItem('quiz') || '{}')
    return {
      steps: [] as Step[],
      currentStep: 0,
      answers: saved.answers || ({} as Answers),
      form:
        saved.form ||
        ({
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
  },

  actions: {
    async fetchSteps() {
      const res = await fetch('https://rendermood.onrender.com/api/steps')
      const data: Step[] = await res.json() // ✅ Исправлено: было "Step[]" без "data:"
      this.steps = data.sort((a: Step, b: Step) => a.order - b.order) // ✅ Явные типы параметров
    },

    setAnswer(questionId: number, value: number | string) {
      if (typeof value === 'number') {
        this.answers[questionId] = { selected: value }
      } else {
        this.answers[questionId] = { custom: value }
      }
      if (questionId === 1) delete this.answers[2]
      this.save()
    },

    toggleCheckbox(questionId: number, optionId: number) {
      const current: AnswerValue = this.answers[questionId] || {}
      let selected: number[] = Array.isArray(current.selected)
        ? [...current.selected]
        : current.selected !== undefined
          ? [current.selected as number]
          : []

      if (selected.includes(optionId)) {
        selected = selected.filter((id: number) => id !== optionId)
      } else {
        selected.push(optionId)
      }
      this.answers[questionId] = { selected }
      this.save()
    },

    setRangeAnswer(questionId: number, value: number) {
      const current: AnswerValue = this.answers[questionId] || {}
      this.answers[questionId] = { ...current, value }
      this.save()
    },

    setCustomInput(questionId: number, value: string) {
      const current: AnswerValue = this.answers[questionId] || {}
      this.answers[questionId] = { ...current, custom: value }
      this.save()
    },

    setAnswerWithCustom(questionId: number, optionId: number, customValue?: string) {
      const current: AnswerValue = this.answers[questionId] || {}
      const payload: AnswerValue = { ...current, selected: optionId } // ✅ Исправлено: спред из объекта
      if (customValue?.trim()) {
        payload.custom = customValue.trim()
      }
      this.answers[questionId] = payload
      this.save()
    },

    setFormField<K extends keyof FormData>(key: K, value: FormData[K]) {
      this.form[key] = value
      this.save()
    },
    setCustomRangeAnswer(questionId: number, value: number) {
      // Для значений вне диапазона сохраняем как custom, а value — для совместимости
      const current = this.answers[questionId] || {}
      this.answers[questionId] = {
        ...current,
        custom: String(value), // строковое представление кастомного значения
        value: value, // числовое для обратной совместимости
      }
      this.save()
    },

    isQuestionValid(questionId: number, type: string): boolean {
      const ans = this.answers[questionId]
      if (!ans) return false

      if (type === 'checkbox') {
        const selected = Array.isArray(ans.selected) ? ans.selected : []
        if (selected.length === 0) return false

        const question = this.steps.find((s: Step) => s.question?.id === questionId)?.question
        const otherOpt = question?.options?.find(
          (o: Option) =>
            o.text.toLowerCase().includes('другое') || o.text.toLowerCase().includes('other'),
        )
        if (otherOpt && selected.includes(otherOpt.id)) {
          return !!ans.custom?.trim()
        }
        return true
      }

      if (type === 'radio') {
        const question = this.steps.find((s: Step) => s.question?.id === questionId)?.question
        const otherOpt = question?.options?.find(
          (o: Option) =>
            o.text.toLowerCase().includes('другое') || o.text.toLowerCase().includes('other'),
        )
        if (otherOpt && ans.selected === otherOpt.id) {
          return !!ans.custom?.trim()
        }
        return ans.selected !== undefined
      }

      if (type === 'range' || type === 'slider') {
        return typeof ans.value === 'number'
      }

      return true
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

    submitQuiz() {
      const cleanAnswers = Object.fromEntries(
        Object.entries(this.answers).map(([key, value]) => {
          const ans = value as AnswerValue
          const cleaned: AnswerValue = { ...ans }
          if (cleaned.custom) cleaned.custom = cleaned.custom.trim()
          if (cleaned.custom === '') delete cleaned.custom
          return [key, cleaned]
        }),
      )

      const payload = {
        name: this.form.name.trim(),
        phone: this.form.phone.trim(),
        email: this.form.email?.trim() || '',
        notes: this.form.comment?.trim() || '',
        answers: cleanAnswers,
      }

      if (!payload.name || !payload.phone) {
        console.error('❌ Обязательные поля пустые')
        return
      }

      console.log('🚀 Отправка:', JSON.stringify(payload, null, 2))

      fetch('http://localhost:3000/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('✅ Успех:', data)
        })
        .catch((err) => console.error('❌ Ошибка:', err))
    },

    save() {
      localStorage.setItem(
        'quiz',
        JSON.stringify({
          answers: this.answers,
          form: this.form,
        }),
      )
    },
  },
})
