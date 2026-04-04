// '@/config/stepConfig.ts'

type StepConfig = {
  component?: 'radio' | 'checkbox' | 'input' | 'range'
  minSelected?: number
  min?: number
  max?: number
  step?: number
  showCustom?: boolean
  showOther?: boolean
}

export const stepConfig: Record<number, StepConfig> = {
  1: {
    component: 'radio',
    showCustom: false,
    showOther: true,           // ← включаем "Другое" на первом шаге
  },
  2: {
    minSelected: 1,
    showCustom: true,
    showOther: false,
  },
  3: {
    component: 'range',
    min: 10,
    max: 200,
    step: 1,
    showCustom: false,
    showOther: false,
  },
}