import { apiClient } from './axios-instance'

export type UserAccountState = 'NORMAL' | 'DELETED' | 'SUSPENDED'
export type OAuthProvider = 'KAKAO' | 'NAVER' | 'X' | 'GOOGLE' | 'APPLE'
export type SanctionType = 'SUSPENDED' | 'WITHDRAWN' | 'RESTORED' | 'CONTENT_DELETED'
export type SanctionSource = 'REPORT' | 'MANUAL'
export type UserContentType = 'FEED' | 'FEED_REPLY' | 'REVIEW' | 'TOPIC_ROOM' | 'CHAT'

export type ApiEnvelope<T> = {
  isSuccess: boolean
  code: string
  message: string
  result: T
  timestamp: string
}

export type AdminUser = {
  userId: number
  nickName: string
  email: string
  oauthProvider: OAuthProvider | string
  joinedAt: string
  accountState: UserAccountState
  suspendedUntil?: string
  lastLoginAt?: string
  reportedCount: number
}

export type AdminUserListResult = {
  content: AdminUser[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type AdminUserDetail = AdminUser & {
  activityStats: {
    boardCount: number
    replyCount: number
    topicRoomParticipationCount: number
    reviewCount: number
    reportedCount: number
  }
}

export type AdminUserContent = {
  contentId: number
  type: UserContentType
  boardId?: number
  parentReplyId?: number
  roomId?: number
  worksId?: number
  content: string
  rating?: string
  messageType?: string
  likeCount: number
  replyCount: number
  createdAt: string
}

export type AdminUserSanction = {
  sanctionId: number
  type: SanctionType
  source: SanctionSource | string
  reportCaseId?: number
  adminId: number
  adminNickName: string
  startedAt: string
  endedAt?: string
  memo?: string
  createdAt: string
}

export type CreateSanctionRequest = {
  type: SanctionType
  targetType?: UserContentType | null
  targetId?: number | null
  memo?: string
}

export const getAdminUsers = async (params?: {
  userId?: number
  nickName?: string
  state?: UserAccountState
  page?: number
  size?: number
  sort?: string[]
}): Promise<ApiEnvelope<AdminUserListResult>> => {
  const response = await apiClient.get('/api/v1/admin/users', { params })
  return response.data
}

export const getAdminUser = async (userId: number): Promise<ApiEnvelope<AdminUserDetail>> => {
  const response = await apiClient.get(`/api/v1/admin/users/${userId}`)
  return response.data
}

export const getAdminUserContents = async (
  userId: number,
  params?: { page?: number; size?: number; sort?: string[] },
): Promise<ApiEnvelope<{ content: AdminUserContent[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }>> => {
  const response = await apiClient.get(`/api/v1/admin/users/${userId}/contents`, { params })
  return response.data
}

export const getAdminUserSanctions = async (
  userId: number,
  params?: { page?: number; size?: number; sort?: string[] },
): Promise<ApiEnvelope<{ content: AdminUserSanction[]; page: number; size: number; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }>> => {
  const response = await apiClient.get(`/api/v1/admin/users/${userId}/sanctions`, { params })
  return response.data
}

export const createAdminUserSanction = async (
  userId: number,
  data: CreateSanctionRequest,
): Promise<ApiEnvelope<object>> => {
  const response = await apiClient.post(`/api/v1/admin/users/${userId}/sanctions`, data)
  return response.data
}
