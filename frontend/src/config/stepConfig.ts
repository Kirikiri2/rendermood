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
    showOther: true,
  },
  
  // 🔁 ПОМЕНЯЛИ МЕСТАМИ:
  
  // step.id: 2 (order: 3) → должен быть ПОЛЗУНОК (Площадь)
  2: {
    component: 'range',
    min: 10,
    max: 200,
    step: 1,
    showCustom: false,
    showOther: false,
  },
  
  // step.id: 3 (order: 2) → должны быть ЧЕКБОКСЫ (Зоны)
  3: {
    component: 'checkbox',
    minSelected: 1,
    showCustom: true,
    showOther: false,
  },
  
  4: { component: 'input', showCustom: false },
  5: { component: 'radio', showCustom: false },
  6: { component: 'input', showCustom: false },
}