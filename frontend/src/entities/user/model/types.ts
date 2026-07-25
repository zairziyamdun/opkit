export interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface AuthResponse {
  readonly accessToken: string
  readonly user: User
}

export interface LoginPayload {
  readonly email: string
  readonly password: string
}

export interface RegisterPayload {
  readonly name: string
  readonly email: string
  readonly password: string
}
