export interface IUser {
  id: number
  name: string
  email: string
  fullname: string | null
  profile: string | null
  role?: 'super_admin' | 'admin_kepegawaian' | 'operator' | 'viewer'
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}

export interface ILoginPayload {
  email: string
  password: string
}

export interface ILoginResponse {
  message: string
  token: string
  user: IUser
}

export interface IProfileResponse {
  data: IUser
}

export interface IApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}
