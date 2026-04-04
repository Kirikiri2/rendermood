export type QuestionType = 'radio' | 'checkbox' | 'input'

export interface Option {
  id: number
  text: string
  questionId: number
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
  selected?: number | number[]
  custom?: string
}

export type Answers = Record<number, AnswerValue>
