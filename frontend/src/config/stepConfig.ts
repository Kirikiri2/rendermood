type StepConfig = {
  minSelected?: number
  component?: 'range'
  min?: number
  max?: number
  step?: number
}

export const stepConfig: Record<number, StepConfig> = {
  2: {
    minSelected: 1,
  },

  3: {
    component: 'range',
    min: 10,
    max: 200,
    step: 1,
  },
}
