'use client'

import { FormEvent, useState } from 'react'
import { AxiosError } from 'axios'
import {
  createAdminUserSanction,
  getAdminUser,
  getAdminUserContents,
  getAdminUserSanctions,
  getAdminUsers,
  type AdminUser,
  type AdminUserContent,
  type AdminUserDetail,
  type AdminUserSanction,
  type CreateSanctionRequest,
  type SanctionType,
  type UserAccountState,
  type UserContentType,
} from '@/lib/api/user.api'

const userColumns = [
  { key: 'userId', label: '유저 ID' },
  { key: 'nickName', label: '닉네임' },
  { key: 'oauthProvider', label: '소셜 로그인' },
  { key: 'joinedAt', label: '가입일' },
  { key: 'accountState', label: '계정 상태' },
  { key: 'reportedCount', label: '신고 횟수' },
  { key: 'actions', label: '작업' },
] as const

const accountStateDesigns: Record<UserAccountState, { label: string; className: string }> = {
  NORMAL: { label: '활성', className: 'user-state-normal' },
  SUSPENDED: { label: '정지', className: 'user-state-suspended' },
  DELETED: { label: '탈퇴', className: 'user-state-deleted' },
}

const providerLabels: Record<string, string> = {
  KAKAO: '카카오',
  NAVER: '네이버',
  X: 'X',
  GOOGLE: '구글',
  APPLE: '애플',
}

const contentTypeLabels: Record<UserContentType, string> = {
  FEED: '피드',
  FEED_REPLY: '댓글',
  REVIEW: '리뷰',
  TOPIC_ROOM: '토픽룸',
  CHAT: '채팅',
}

const sanctionTypeLabels: Record<SanctionType, string> = {
  SUSPENDED: '계정 정지',
  WITHDRAWN: '계정 삭제',
  RESTORED: '계정 복구',
  CONTENT_DELETED: '콘텐츠 삭제',
}

type ApiErrorBody = {
  code?: string
  message?: string
}

type AccountSanctionAction = 'SUSPENDED' | 'WITHDRAWN'

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null)
  const [userContents, setUserContents] = useState<AdminUserContent[]>([])
  const [userSanctions, setUserSanctions] = useState<AdminUserSanction[]>([])
  const [contentDeleteTarget, setContentDeleteTarget] = useState<AdminUserContent | null>(null)
  const [contentDeleteMemo, setContentDeleteMemo] = useState('')
  const [showAccountSanctionModal, setShowAccountSanctionModal] = useState(false)
  const [accountSanctionAction, setAccountSanctionAction] = useState<AccountSanctionAction>('SUSPENDED')
  const [accountSanctionMemo, setAccountSanctionMemo] = useState('')

  const fetchUsers = async (query: string, page = 0) => {
    const trimmedQuery = query.trim()

    setLoading(true)
    setErrorMessage('')

    try {
      const params: Parameters<typeof getAdminUsers>[0] = { page }

      if (trimmedQuery) {
        const numericQuery = Number(trimmedQuery)
        if (Number.isInteger(numericQuery) && numericQuery > 0) {
          params.userId = numericQuery
        } else {
          params.nickName = trimmedQuery
        }
      }

      const response = await getAdminUsers(params)
      if (response.isSuccess) {
        setUsers(response.result.content)
        setCurrentPage(response.result.page)
        setTotalPages(response.result.totalPages)
      }
    } catch (error) {
      const errorInfo = getApiErrorInfo(error)
      console.error('유저 목록 조회 실패:', errorInfo)
      setUsers([])
      setErrorMessage(errorInfo.message || '유저 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const openUserDetail = async (userId: number) => {
    setDetailLoading(true)
    setErrorMessage('')

    try {
      const [detailResponse, contentsResponse, sanctionsResponse] = await Promise.all([
        getAdminUser(userId),
        getAdminUserContents(userId, { page: 0, size: 10 }),
        getAdminUserSanctions(userId, { page: 0, size: 10 }),
      ])

      if (detailResponse.isSuccess) setSelectedUser(detailResponse.result)
      if (contentsResponse.isSuccess) setUserContents(contentsResponse.result.content)
      if (sanctionsResponse.isSuccess) setUserSanctions(sanctionsResponse.result.content)
    } catch (error) {
      const errorInfo = getApiErrorInfo(error)
      console.error('유저 상세 조회 실패:', errorInfo)
      setErrorMessage(errorInfo.message || '유저 상세 정보를 불러오지 못했습니다.')
    } finally {
      setDetailLoading(false)
    }
  }

  const refreshSelectedUser = async () => {
    if (!selectedUser) return
    await openUserDetail(selectedUser.userId)
  }

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasSearched(true)
    setSelectedUser(null)
    setAppliedSearchQuery(searchQuery)
    await fetchUsers(searchQuery, 0)
  }

  const handlePageChange = async (page: number) => {
    await fetchUsers(appliedSearchQuery, page)
  }

  const closeContentDeleteModal = () => {
    if (saving) return
    setContentDeleteTarget(null)
    setContentDeleteMemo('')
  }

  const closeAccountSanctionModal = () => {
    if (saving) return
    setShowAccountSanctionModal(false)
    setAccountSanctionAction('SUSPENDED')
    setAccountSanctionMemo('')
  }

  const handleContentDelete = async () => {
    if (!selectedUser || !contentDeleteTarget) return

    await submitSanction(
      {
        type: 'CONTENT_DELETED',
        targetType: contentDeleteTarget.type,
        targetId: contentDeleteTarget.contentId,
        memo: contentDeleteMemo.trim() || undefined,
      },
      '콘텐츠 삭제',
      closeContentDeleteModal,
    )
  }

  const handleAccountSanction = async () => {
    await submitSanction(
      {
        type: accountSanctionAction,
        targetType: null,
        targetId: null,
        memo: accountSanctionMemo.trim() || undefined,
      },
      '계정 제재',
      closeAccountSanctionModal,
    )
  }

  const submitSanction = async (
    payload: CreateSanctionRequest,
    actionName: string,
    onSuccess: () => void,
  ) => {
    if (!selectedUser) return

    setSaving(true)
    try {
      const response = await createAdminUserSanction(selectedUser.userId, payload)
      if (response.isSuccess) {
        onSuccess()
        await refreshSelectedUser()
      }
    } catch (error) {
      const errorInfo = getApiErrorInfo(error)
      console.error(`${actionName} 실패:`, {
        ...errorInfo,
        payload,
      })
      alert(errorInfo.message || `${actionName}에 실패했습니다.`)
    } finally {
      setSaving(false)
    }
  }

  const renderPagination = () => {
    if (!hasSearched || totalPages <= 1) return null

    return (
      <div className="pagination user-pagination">
        <button
          className="pagination-button"
          onClick={() => void handlePageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            className={`pagination-button ${currentPage === index ? 'active' : ''}`}
            onClick={() => void handlePageChange(index)}
            type="button"
          >
            {index + 1}
          </button>
        ))}

        <button
          className="pagination-button"
          onClick={() => void handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="user-page-container">
      <div className="page-head user-page-head">
        <div>
          <h1>유저 관리</h1>
        </div>
      </div>

      {selectedUser ? (
        <section className="user-detail-card">
          <button className="user-breadcrumb" onClick={() => setSelectedUser(null)} type="button">
            유저 관리 &gt; 상세
          </button>

          <section>
            <h2>기본 정보</h2>
            <div className="user-info-list">
              <DetailItem label="닉네임" value={selectedUser.nickName} />
              <DetailItem label="소셜 로그인" value={providerLabels[selectedUser.oauthProvider] ?? selectedUser.oauthProvider} />
              <DetailItem label="가입일" value={formatDate(selectedUser.joinedAt)} />
              <div className="user-info-row">
                <span>계정 상태</span>
                <strong>
                  <span className={`user-state-chip ${accountStateDesigns[selectedUser.accountState].className}`}>
                    {accountStateDesigns[selectedUser.accountState].label}
                  </span>
                </strong>
              </div>
            </div>
          </section>

          {detailLoading ? <p className="login-message">상세 정보를 불러오는 중...</p> : null}

          <div className="user-detail-grid">
            <section>
              <h2>활동 통계</h2>
              <div className="activity-stat-grid">
                <StatCard label="피드" value={selectedUser.activityStats.boardCount} />
                <StatCard label="댓글" value={selectedUser.activityStats.replyCount} />
                <StatCard label="토픽룸 참여" value={selectedUser.activityStats.topicRoomParticipationCount} />
                <StatCard label="피신고 횟수" value={selectedUser.activityStats.reportedCount} />
              </div>
            </section>

            <section>
              <h2>제재 이력</h2>
              <table className="compact-user-table">
                <thead>
                  <tr>
                    <th>일자</th>
                    <th>조치</th>
                    <th>코멘트</th>
                  </tr>
                </thead>
                <tbody>
                  {userSanctions.length === 0 ? (
                    <tr>
                      <td colSpan={3}>제재 이력이 없습니다.</td>
                    </tr>
                  ) : (
                    userSanctions.map((sanction) => (
                      <tr key={sanction.sanctionId}>
                        <td>{formatDate(sanction.createdAt)}</td>
                        <td>{sanctionTypeLabels[sanction.type] ?? sanction.type}</td>
                        <td>{sanction.memo || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </div>

          <section className="recent-content-section">
            <h2>최근 작성 콘텐츠</h2>
            <div className="recent-content-list">
              {userContents.length === 0 ? (
                <p className="empty-note">최근 작성 콘텐츠가 없습니다.</p>
              ) : (
                userContents.map((content) => (
                  <div className="recent-content-row" key={`${content.type}-${content.contentId}`}>
                    <span className="content-type-chip">{contentTypeLabels[content.type] ?? content.type}</span>
                    <p>{content.content}</p>
                    <button className="black-action-button" onClick={() => setContentDeleteTarget(content)} type="button">
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="user-detail-actions">
            <button className="btn-primary" onClick={() => setShowAccountSanctionModal(true)} type="button">
              계정 제재
            </button>
          </div>
        </section>
      ) : (
        <>
          <form className="user-search-form" onSubmit={handleSearchSubmit}>
            <label className="user-search-label" htmlFor="user-search">
              유저 검색
            </label>
            <div className="user-search-box">
              <input
                id="user-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="닉네임 또는 유저 ID 검색"
              />
              <button type="submit" aria-label="검색">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          {hasSearched ? (
            <>
              <div className="event-table-panel user-table-panel">
                <table className="event-table user-table">
                  <thead>
                    <tr>
                      {userColumns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={userColumns.length}>로딩 중...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={userColumns.length}>검색 결과가 없습니다.</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.userId} className="event-row">
                          <td>
                            <span className="user-id-text">U-{user.userId}</span>
                          </td>
                          <td>{user.nickName}</td>
                          <td>{providerLabels[user.oauthProvider] ?? user.oauthProvider}</td>
                          <td>{formatDate(user.joinedAt)}</td>
                          <td>
                            <span className={`user-state-chip ${accountStateDesigns[user.accountState].className}`}>
                              {accountStateDesigns[user.accountState].label}
                            </span>
                          </td>
                          <td>{user.reportedCount}</td>
                          <td>
                            <button className="table-action-button" onClick={() => void openUserDetail(user.userId)} type="button">
                              상세 보기
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {renderPagination()}
            </>
          ) : null}
        </>
      )}

      {errorMessage ? <p className="login-message">{errorMessage}</p> : null}

      {contentDeleteTarget ? (
        <div className="modal-overlay" onClick={closeContentDeleteModal}>
          <div className="modal-container user-action-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>콘텐츠 삭제</h2>
              <p>{selectedUser?.nickName}님의 콘텐츠를 삭제합니다.</p>
            </div>

            <div className="modal-body">
              <div className="content-delete-preview">
                <span>
                  {selectedUser?.nickName} · {formatDateTime(contentDeleteTarget.createdAt)}
                </span>
                <strong>{contentDeleteTarget.content}</strong>
              </div>
              <label className="field">
                <span>내부기록용 메모를 작성해주세요.</span>
                <textarea
                  value={contentDeleteMemo}
                  onChange={(event) => setContentDeleteMemo(event.target.value)}
                  placeholder="내부 기록용 메모 입력"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={closeContentDeleteModal} disabled={saving} type="button">
                취소
              </button>
              <button className="btn-modal-confirm black" onClick={() => void handleContentDelete()} disabled={saving} type="button">
                콘텐츠 삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAccountSanctionModal ? (
        <div className="modal-overlay" onClick={closeAccountSanctionModal}>
          <div className="modal-container user-action-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>계정 제재</h2>
              <p>계정 제재 항목을 선택하세요.</p>
            </div>

            <div className="modal-body">
              <div className="sanction-option-list">
                <button
                  className={`sanction-option ${accountSanctionAction === 'SUSPENDED' ? 'selected' : ''}`}
                  onClick={() => setAccountSanctionAction('SUSPENDED')}
                  type="button"
                >
                  <strong>계정 정지</strong>
                  <span>7일 임시 정지 · 만료 시 자동 활성화</span>
                </button>
                <button
                  className={`sanction-option ${accountSanctionAction === 'WITHDRAWN' ? 'selected' : ''}`}
                  onClick={() => setAccountSanctionAction('WITHDRAWN')}
                  type="button"
                >
                  <strong>계정 삭제</strong>
                  <span>유저 강제 탈퇴</span>
                </button>
              </div>
              <label className="field">
                <span>내부기록용 메모를 작성해주세요.</span>
                <textarea
                  value={accountSanctionMemo}
                  onChange={(event) => setAccountSanctionMemo(event.target.value)}
                  placeholder="내부 기록용 메모 입력"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={closeAccountSanctionModal} disabled={saving} type="button">
                취소
              </button>
              <button className="btn-modal-confirm" onClick={() => void handleAccountSanction()} disabled={saving} type="button">
                처리 완료 확정
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="user-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="activity-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} · ${hour}:${minute}`
}

function getApiErrorInfo(error: unknown) {
  const axiosError = error as AxiosError<ApiErrorBody>

  return {
    status: axiosError.response?.status,
    code: axiosError.response?.data?.code,
    message: axiosError.response?.data?.message,
    data: axiosError.response?.data,
  }
}
