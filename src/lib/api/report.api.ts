import { apiClient } from './axios-instance'

export type TargetType = 'FEED' | 'FEED_REPLY' | 'REVIEW' | 'TOPIC_ROOM' | 'CHAT'
export type ReportStatus = 'RECEIVED' | 'REJECTED' | 'COMPLETED'
export type ProcessAction = 'CONTENT_DELETED' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_DELETED'

export type ReportListItem = {
  reportCaseId: number
  targetType: TargetType
  targetId: number
  reportedUserId: number
  reportedUserNickName: string
  status: ReportStatus
  reportCount: number
  processedByAdminId?: number
  processAction?: ProcessAction
  createdAt: string
  processedAt?: string
  reopened: boolean
}

export type ReportListResponse = {
  isSuccess: boolean
  code: string
  message: string
  result: {
    totalPages: number
    totalElements: number
    last: boolean
    first: boolean
    numberOfElements: number
    size: number
    content: ReportListItem[]
    number: number
    empty: boolean
  }
  timestamp: string
}

export type ReportDetail = {
  reportCaseId: number
  targetType: TargetType
  targetId: number
  status: ReportStatus
  processedByAdminId?: number
  processMemo?: string
  processAction?: ProcessAction
  receivedAt: string
  processedAt?: string
  reopened: boolean
  summary: {
    reportedUserId: number
    reportedUserNickName: string
    location: string
    reason: string
    otherReason?: string
    reportCount: number
    firstReportedAt: string
  }
  reports: Array<{
    reportId: number
    reporterId: number
    reporterNickName: string
    reportedUserId: number
    reason: string
    otherReason?: string
    reportedAt: string
  }>
  reportedContent: {
    targetType: TargetType
    targetId: number
    parentTargetId?: number
    authorUserId: number
    authorNickName: string
    content: string
    createdAt: string
    chatMessages?: Array<{
      messageId: number
      senderId: number
      senderNickName: string
      message: string
      messageType: string
      createdAt: string
    }>
  }
}

export type ReportDetailResponse = {
  isSuccess: boolean
  code: string
  message: string
  result: ReportDetail
  timestamp: string
}

export type ProcessReportRequest = {
  status: ReportStatus
  processAction?: ProcessAction
  processMemo?: string
}

export type ProcessReportResponse = {
  isSuccess: boolean
  code: string
  message: string
  result: {}
  timestamp: string
}

/**
 * 신고 목록 조회
 */
export const getReportList = async (params?: {
  targetType?: TargetType
  status?: ReportStatus
  startAt?: string
  endAt?: string
  reportedUserId?: number
  page?: number
  size?: number
}): Promise<ReportListResponse> => {
  const response = await apiClient.get('/api/v1/admin/reports', { params })
  return response.data
}

/**
 * 신고 상세 조회
 */
export const getReportDetail = async (reportCaseId: number): Promise<ReportDetailResponse> => {
  const response = await apiClient.get(`/api/v1/admin/reports/${reportCaseId}`)
  return response.data
}

/**
 * 신고 처리
 */
export const processReport = async (
  reportCaseId: number,
  data: ProcessReportRequest
): Promise<ProcessReportResponse> => {
  const response = await apiClient.patch(`/api/v1/admin/reports/${reportCaseId}`, data)
  return response.data
}
