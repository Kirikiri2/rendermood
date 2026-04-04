export type QuestionType = 'input' | 'radio' | 'checkbox' | 'range' | 'slider' | 'carousel'

export interface Option {
  id: number
  text: string
  questionId: number
  isOther?: boolean
  group?: 'residential' | 'commercial' | 'other'
  propertyType?: 'residential' | 'commercial'
  createdAt: string
}

export interface Question {
  id: number
  text: string
  type: QuestionType
  stepId: number
  createdAt: string
  imageUrl: string | null
  min: number | null
  max: number | null
  stepValue: number | null
  defaultValue: number | null
  isRequired: boolean
  options: Option[]
}

export type Step = {
  id: number
  title: string
  order: number
  type: 'question' | 'form'
  createdAt: string
  question?: Question
}

export type AnswerValue = {
  selected?: number | number[]
  value?: number
  custom?: string
  otherText?: string
}

export type Answers = Record<number, AnswerValue>

export type SubmissionData = {
  name: string
  phone: string
  email?: string
  notes?: string
  answers: Answers
}

export type FormData = {
  name: string
  phone: string
  email: string
  comment: string
  agree: boolean
}