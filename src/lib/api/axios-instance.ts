import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송을 위해 필요
})

// 요청 인터셉터 - 액세스 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    // 로그인/회원가입 요청은 토큰 불필요
    if (config.url?.includes('/auth/admin/login') || config.url?.includes('/auth/admin/signup')) {
      return config
    }

    // 로컬스토리지에서 액세스 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 토큰 갱신 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 리프레시 토큰은 쿠키에 저장되어 있으므로 자동으로 전송됨
        const response = await axios.post(
          '/api/v1/auth/tokens/refresh',
          {},
          { withCredentials: true }
        )

        const newAccessToken = response.data?.result?.accessToken

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken')
        document.cookie = 'accessToken=; path=/; max-age=0'
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
