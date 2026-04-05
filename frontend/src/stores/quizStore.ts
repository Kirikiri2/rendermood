// stores/quizStore.ts
import type { Answers, AnswerValue, FormData, Step, Option, QuizSubmission, SubmissionResult } from '@/shared/quiz'
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
        throw err
      }
    },

    setAnswer(questionId: number, value: number | string) {
      if (typeof value === 'number') {
        this.answers[questionId] = { selected: value }
      } else {
        this.answers[questionId] = { custom: value }
      }

      // При смене типа помещения очищаем выбранные зоны
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
        selected = selected.filter((id) => id !== optionId)
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
      const payload: AnswerValue = { ...current, selected: optionId }

      if (customValue?.trim()) {
        payload.custom = customValue.trim()
      }

      this.answers[questionId] = payload
      this.save()
    },

    setCustomRangeAnswer(questionId: number, value: number) {
      const current = this.answers[questionId] || {}
      this.answers[questionId] = { ...current, custom: String(value), value }
      this.save()
    },

    setFormField<K extends keyof FormData>(key: K, value: FormData[K]) {
      this.form[key] = value
      this.save()
    },

    setRadioAnswer(questionId: number, optionId: number) {
      this.answers[questionId] = { selected: optionId }
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

        if (otherOpt && selected.includes(otherOpt.id)) {
          return !!ans.custom?.trim()
        }
        return true
      }

      if (type === 'radio') {
        const question = this.steps.find((s) => s.question?.id === questionId)?.question
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

    /**
     * 🔥 Основной метод отправки — преобразует данные в формат API
     */
async submitQuiz(): Promise<SubmissionResult> {
  try {
const answersArray = Object.entries(this.answers).map(([questionIdStr, answer]) => {
  const questionId = Number(questionIdStr)
  const ans = answer as AnswerValue

  const question = this.steps.find((s) => s.question?.id === questionId)?.question

  let value: string | null = null
  let numberValue: number | null = null
  let optionId: number | null = null

  // 🔥 1. RADIO / CAROUSEL
  if (typeof ans.selected === 'number') {
    optionId = ans.selected

    const option = question?.options?.find((o) => o.id === ans.selected)
    value = option?.text ?? null
  }

  // 🔥 2. CHECKBOX
  else if (Array.isArray(ans.selected)) {
    value = ans.selected
      .map((id) => question?.options?.find((o) => o.id === id)?.text)
      .filter(Boolean)
      .join(', ')
  }

  // 🔥 3. INPUT / CUSTOM
  if (ans.custom?.trim()) {
    value = ans.custom.trim()
  }

  // 🔥 4. SLIDER (ВАЖНО)
  if (typeof ans.value === 'number') {
    numberValue = ans.value
  }

  return {
    questionId,
    optionId,
    value,
    numberValue, // ✅ теперь правильно
  }
})
if (!this.form.agree) {
  throw new Error('Необходимо согласие на обработку данных')
}
    const payload: QuizSubmission = {
      name: this.form.name.trim(),
      phone: this.form.phone.trim(),
      email: this.form.email?.trim() || '',
      comment: this.form.comment?.trim() || '',
      consent: Boolean(this.form.agree),
      answers: answersArray,
    }

    // 🔐 validation
    if (!payload.name || !payload.phone) {
      throw new Error('Имя и телефон обязательны')
    }

    console.log('🚀 SENDING PAYLOAD:', payload)

    const res = await fetch('https://rendermood.onrender.com/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // 🔥 важно: читаем ответ всегда
    const raw = await res.text()

    let data
    try {
      data = JSON.parse(raw)
    } catch {
      data = raw
    }

    if (!res.ok) {
      console.error('❌ BACKEND ERROR:', data)

      throw new Error(
        typeof data === 'string'
          ? data
          : data?.message || `HTTP ${res.status}`
      )
    }

    console.log('✅ SUCCESS:', data)

    this.clearStorage()

    return {
      success: true,
      data,
    }
  } catch (err) {
    console.error('❌ submitQuiz failed:', err)

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
},

    /**
     * 🧹 Очистка localStorage и сброс состояния
     */
    clearStorage() {
      localStorage.removeItem('quiz')
      // Сбрасываем только answers и form, шаги оставляем (они статичные)
      this.answers = {} as Answers
      this.form = {
        name: '',
        phone: '',
        email: '',
        comment: '',
        agree: false,
      }
      this.currentStep = 0
    },

    /**
     * 💾 Сохранение в localStorage
     */
    save() {
      localStorage.setItem(
        'quiz',
        JSON.stringify({
          answers: this.answers,
          form: this.form,
        }),
      )
    },

    /**
     * 🔁 Полный сброс стора (если нужно начать квиз заново)
     */
    $reset() {
      this.clearStorage()
      this.steps = []
      this.currentStep = 0
    },
  },
})
