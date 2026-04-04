export type QuestionType = 'radio' | 'checkbox' | 'input'

export interface Option {
  id: number
  text: string
  questionId: number
  isOther?: boolean
}

export interface Question {
  id: number
  text: string
  type: QuestionType
  stepId: number
  createdAt: string
  options: Option[]
}

export interface Step {
  id: number
  title: string
  order: number
  question: Question
}

export type AnswerValue = {
  selected?: number | number[] // для radio / checkbox
  value?: number // для range
  custom?: string // для input / доп. поля
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
