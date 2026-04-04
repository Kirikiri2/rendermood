// shared/quiz.ts
export interface Option {
  id: number
  text: string
  questionId: number
  propertyType: 'residential' | 'commercial' | null
  imageUrl: string | null
  createdAt: string
}

export interface Question {
  id: number
  text: string
  type: 'radio' | 'checkbox' | 'input' | 'range' | 'slider' | 'carousel'
  stepId: number
  min: number | null
  max: number | null
  stepValue: number | null
  defaultValue: number | null
  isRequired: boolean
  createdAt: string
  options?: Option[]
}

export interface Step {
  id: number
  title: string
  order: number
  type: 'question' | 'form'
  createdAt: string
  question?: Question
}

export interface AnswerValue {
  selected?: number | number[]
  custom?: string
  value?: number
}

export type Answers = Record<number, AnswerValue>

export interface FormData {
  name: string
  phone: string
  email: string
  comment: string
  agree: boolean
}