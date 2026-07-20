import { apiClient } from './axios-instance'

export type AdminLoginRequest = {
  email: string
  password: string
}

export type AdminLoginResponse = {
  isSuccess: boolean
  code: string
  message: string
  result: {
    accessToken: string
    refreshToken: string
  }
  timestamp: string
}

export type AdminProfileResponse = {
  isSuccess: boolean
  code: string
  message: string
  result: {
    nickName: string
    email: string
  }
  timestamp: string
}

/**
 * 관리자 로그인
 */
export const adminLogin = async (
  data: AdminLoginRequest
): Promise<AdminLoginResponse> => {
  const response = await apiClient.post('/api/v1/auth/admin/login', data)
  return response.data
}

/**
 * 관리자 프로필 조회
 */
export const getAdminProfile = async (): Promise<AdminProfileResponse> => {
  const response = await apiClient.get('/api/v1/auth/admin/profile')
  return response.data
}
