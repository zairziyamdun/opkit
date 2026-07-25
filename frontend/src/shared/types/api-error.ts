export interface ApiFieldError {
  readonly field: string
  readonly messages: readonly string[]
}

export interface ApiError {
  readonly statusCode: number
  readonly message: string
  readonly fieldErrors: readonly ApiFieldError[]
}
