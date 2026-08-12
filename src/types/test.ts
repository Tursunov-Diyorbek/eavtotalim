import type { Id } from './common'

export type QuestionOption = {
  id: Id
  text: string
  isCorrect: boolean
}

export type Question = {
  id: Id
  topicId?: Id
  text: string
  options: QuestionOption[]
}

export type TestAttempt = {
  id: Id
  studentId: Id
  startedAt: string
  finishedAt?: string
  scorePercent?: number
}
