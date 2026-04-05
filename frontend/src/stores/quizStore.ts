// stores/quizStore.ts
import type { Answers, AnswerValue, FormData, Step, Option } from '@/shared/quiz'
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
    currentStepData: (state): Step | undefined => {
      return state.steps[state.currentStep]
    },
  },

  actions: {
    async fetchSteps() {
      try {
        const res = await fetch('https://rendermood.onrender.com/api/steps')
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        const data = await res.json()

        console.log('📦 API response:', data)

        let steps: Step[] = []

        if (Array.isArray(data)) steps = data
        else if (Array.isArray(data.steps)) steps = data.steps
        else {
          console.error('❌ Неверный формат данных:', data)
          return
        }

        this.steps = steps.sort((a, b) => a.order - b.order)
        console.log('✅ Steps loaded:', this.steps)
      } catch (err) {
        console.error('❌ Ошибка загрузки шагов:', err)
      }
    },

    setAnswer(questionId: number, value: number | string) {
      if (typeof value === 'number') this.answers[questionId] = { selected: value }
      else this.answers[questionId] = { custom: value }

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

      if (selected.includes(optionId)) selected = selected.filter((id) => id !== optionId)
      else selected.push(optionId)

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

      const payload: AnswerValue = {
        ...current,
        selected: optionId,
      }

      if (customValue?.trim()) payload.custom = customValue.trim()

      this.answers[questionId] = payload
      this.save()
    },

    setCustomRangeAnswer(questionId: number, value: number) {
      const current = this.answers[questionId] || {}
      this.answers[questionId] = { ...current, custom: String(value), value: value }
      this.save()
    },

    setFormField<K extends keyof FormData>(key: K, value: FormData[K]) {
      this.form[key] = value
      this.save()
    },

    isQuestionValid(questionId: number, type: string): boolean {
      const ans = this.answers[questionId]
      if (!ans) return false

      if (type === 'checkbox') {
        const selected = Array.isArray(ans.selected) ? ans.selected : []
        if (selected.length === 0) return false

        const question = this.steps.find((s) => s.question?.id === questionId)?.question
        const otherOpt = question?.options?.find(
          (o: Option) =>
            o.text.toLowerCase().includes('другое') || o.text.toLowerCase().includes('other'),
        )

        if (otherOpt && selected.includes(otherOpt.id)) return !!ans.custom?.trim()
        return true
      }

      if (type === 'radio') {
        const question = this.steps.find((s) => s.question?.id === questionId)?.question
        const otherOpt = question?.options?.find(
          (o: Option) =>
            o.text.toLowerCase().includes('другое') || o.text.toLowerCase().includes('other'),
        )

        if (otherOpt && ans.selected === otherOpt.id) return !!ans.custom?.trim()
        return ans.selected !== undefined
      }

      if (type === 'range' || type === 'slider') return typeof ans.value === 'number'

      return true
    },

    nextStep() {
      if (this.currentStep < this.steps.length - 1) this.currentStep++
    },

    prevStep() {
      if (this.currentStep > 0) this.currentStep--
    },

    async submitQuiz() {
      try {
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

        console.log('🚀 Отправка:', payload)

        const res = await fetch('https://rendermood.onrender.com/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()
        console.log('✅ Успех:', data)
      } catch (err) {
        console.error('❌ Ошибка отправки:', err)
      }
    },

    // 🔹 Добавленный метод для SubmissionStep.vue
    submitForm() {
      this.submitQuiz()
    },
    setRadioAnswer(questionId: number, optionId: number) {
      this.answers[questionId] = { selected: optionId }
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
