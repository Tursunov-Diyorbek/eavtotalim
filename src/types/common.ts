export type Id = string

export type Role = 'admin' | 'instructor' | 'student'

export type ApiListResponse<T> = {
  data: T[]
  total: number
}

export type ApiError = {
  message: string
  code?: string
}
