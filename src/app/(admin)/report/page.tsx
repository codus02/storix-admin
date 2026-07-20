'use client'

import { useState, useEffect } from 'react'
import { getReportList, getReportDetail, processReport, type ReportListItem, type ReportDetail, type TargetType, type ReportStatus, type ProcessAction } from '@/lib/api/report.api'

const targetTypeLabels: Record<TargetType, string> = {
  FEED: '피드',
  FEED_REPLY: '피드 댓글',
  REVIEW: '리뷰',
  TOPIC_ROOM: '토픽룸',
  CHAT: '채팅',
}

const statusLabels: Record<ReportStatus, '접수' | '처리완료' | '반려'> = {
  RECEIVED: '접수',
  COMPLETED: '처리완료',
  REJECTED: '반려',
}

const actionLabels: Record<ProcessAction, string> = {
  CONTENT_DELETED: '콘텐츠 삭제',
  ACCOUNT_SUSPENDED: '계정 정지',
  ACCOUNT_DELETED: '계정 삭제',
}

export default function ReportPage() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
  const [selectedReportDetail, setSelectedReportDetail] = useState<ReportDetail | null>(null)
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetType | '전체'>('전체')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | '전체'>('전체')
  const [currentPage, setCurrentPage] = useState(0)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedActions, setSelectedActions] = useState<ProcessAction[]>([])
  const [processComment, setProcessComment] = useState('')
  const [reports, setReports] = useState<ReportListItem[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)

  const targetTypes: Array<TargetType | '전체'> = ['전체', 'FEED', 'FEED_REPLY', 'REVIEW', 'TOPIC_ROOM', 'CHAT']
  const statuses: Array<ReportStatus | '전체'> = ['전체', 'RECEIVED', 'REJECTED', 'COMPLETED']

  // 신고 목록 조회
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const params: any = {
          page: currentPage,
          size: 10,
        }
        if (targetTypeFilter !== '전체') params.targetType = targetTypeFilter
        if (statusFilter !== '전체') params.status = statusFilter
        if (dateFilter) {
          params.startAt = `${dateFilter}T00:00:00`
          params.endAt = `${dateFilter}T23:59:59`
        }

        const response = await getReportList(params)
        if (response.isSuccess) {
          setReports(response.result.content)
          setTotalPages(response.result.totalPages)
          setTotalElements(response.result.totalElements)
        }
      } catch (error) {
        console.error('신고 목록 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [currentPage, targetTypeFilter, statusFilter, dateFilter])

  // 신고 상세 조회
  useEffect(() => {
    const fetchReportDetail = async () => {
      if (!selectedReportId) {
        setSelectedReportDetail(null)
        return
      }

      try {
        const response = await getReportDetail(selectedReportId)
        if (response.isSuccess) {
          setSelectedReportDetail(response.result)
        }
      } catch (error) {
        console.error('신고 상세 조회 실패:', error)
      }
    }

    fetchReportDetail()
  }, [selectedReportId])

  const getStatusClass = (status: ReportStatus) => {
    switch (status) {
      case 'RECEIVED':
        return 'badge n'
      case 'COMPLETED':
        return 'badge g'
      case 'REJECTED':
        return 'badge a'
      default:
        return 'badge n'
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleReject = async () => {
    if (!selectedReportId || !selectedReportDetail) return

    try {
      await processReport(selectedReportId, {
        status: 'REJECTED',
        processMemo: processComment || undefined,
      })

      // 목록 새로고침
      setSelectedReportId(null)
      setCurrentPage(0)
    } catch (error) {
      console.error('신고 반려 실패:', error)
      alert('신고 반려에 실패했습니다.')
    }
  }

  const handleProcessClick = () => {
    setShowProcessModal(true)
    setSelectedActions([])
    setProcessComment('')
  }

  const toggleAction = (action: ProcessAction) => {
    setSelectedActions((prev) => (prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]))
  }

  const handleProcessConfirm = async () => {
    if (!selectedReportId || selectedActions.length === 0) {
      alert('처리 액션을 하나 이상 선택해주세요.')
      return
    }

    try {
      // 여러 액션 중 첫 번째만 전송 (API가 단일 액션만 지원)
      await processReport(selectedReportId, {
        status: 'COMPLETED',
        processAction: selectedActions[0],
        processMemo: processComment || undefined,
      })

      setShowProcessModal(false)
      // 목록 새로고침
      setSelectedReportId(null)
      setCurrentPage(0)
    } catch (error) {
      console.error('신고 처리 실패:', error)
      alert('신고 처리에 실패했습니다.')
    }
  }

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -2, totalPages)
      }
    }

    return (
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {pages.map((page, index) => {
          if (page === -1 || page === -2) {
            return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          }
          return (
            <button
              key={page}
              className={`pagination-button ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          )
        })}

        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="report-page-container">
      {!selectedReportDetail ? (
        <>
          <div className="page-head">
            <div>
              <h1>신고 관리</h1>
              <p className="page-sub">신고 접수 목록</p>
            </div>
          </div>

          <div className="toolbar">
            <div className="select-wrap">
              <select value={targetTypeFilter} onChange={(e) => setTargetTypeFilter(e.target.value as TargetType | '전체')}>
                <option value="전체">신고 유형</option>
                {targetTypes.filter(t => t !== '전체').map((type) => (
                  <option key={type} value={type}>
                    {targetTypeLabels[type as TargetType]}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-wrap">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="date-input"
                placeholder="신고일자"
              />
            </div>

            <div className="select-wrap">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '전체')}>
                <option value="전체">처리 상태</option>
                {statuses.filter(s => s !== '전체').map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status as ReportStatus]}
                  </option>
                ))}
              </select>
            </div>

            <span className="filter-note">전체 {totalElements}건</span>
          </div>

          {loading ? (
            <div className="event-table-panel">
              <div style={{ padding: '60px', textAlign: 'center', color: '#9a9aa4' }}>로딩 중...</div>
            </div>
          ) : (
            <>
              <div className="event-table-panel">
                <table className="event-table">
                  <thead>
                    <tr>
                      <th>케이스 ID</th>
                      <th>신고 유형</th>
                      <th>피신고자</th>
                      <th>신고 건수</th>
                      <th>접수일시</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.reportCaseId} className="event-row" onClick={() => setSelectedReportId(report.reportCaseId)}>
                        <td>{report.reportCaseId}</td>
                        <td>{targetTypeLabels[report.targetType]}</td>
                        <td>{report.reportedUserNickName} (U-{report.reportedUserId})</td>
                        <td>{report.reportCount}건</td>
                        <td className="period">{new Date(report.createdAt).toLocaleString('ko-KR')}</td>
                        <td>
                          <span className={getStatusClass(report.status)}>
                            <span className="bdot"></span>
                            {statusLabels[report.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && renderPagination()}
            </>
          )}
        </>
      ) : (
        <div className="report-detail-container">
          <div className="page-head">
            <div>
              <h1>신고 정보 요약</h1>
              <p className="page-sub">
                <span className={getStatusClass(selectedReportDetail.status)}>
                  <span className="bdot"></span>
                  {statusLabels[selectedReportDetail.status]}
                </span>
              </p>
            </div>
          </div>

          <div className="report-detail-panel">
            <div className="report-detail-row">
              <span className="detail-label">신고 유형</span>
              <span className="detail-value">{targetTypeLabels[selectedReportDetail.targetType]}</span>
            </div>
            <div className="report-detail-row">
              <span className="detail-label">피신고 대상</span>
              <span className="detail-value report-highlight">
                {selectedReportDetail.summary.reportedUserNickName} (U-{selectedReportDetail.summary.reportedUserId})
              </span>
            </div>
            <div className="report-detail-row">
              <span className="detail-label">신고 건수</span>
              <span className="detail-value">{selectedReportDetail.summary.reportCount}건</span>
            </div>
            <div className="report-detail-row">
              <span className="detail-label">신고 사유</span>
              <span className="detail-value">{selectedReportDetail.summary.reason}</span>
            </div>
            <div className="report-detail-row">
              <span className="detail-label">신고 발생 위치</span>
              <span className="detail-value">{selectedReportDetail.summary.location}</span>
            </div>
            <div className="report-detail-row">
              <span className="detail-label">최초 신고일시</span>
              <span className="detail-value">{new Date(selectedReportDetail.summary.firstReportedAt).toLocaleString('ko-KR')}</span>
            </div>

            <div className="report-content-section">
              <h3>피신고 콘텐츠 원문</h3>
              <div className="report-content-box">
                <p className="content-meta">
                  {selectedReportDetail.reportedContent.authorNickName} · {new Date(selectedReportDetail.reportedContent.createdAt).toLocaleString('ko-KR')}
                </p>
                <p className="content-text">{selectedReportDetail.reportedContent.content}</p>
              </div>
            </div>

            {selectedReportDetail.processAction && (
              <div className="report-detail-row">
                <span className="detail-label">조치 및 코멘트</span>
                <span className="detail-value" style={{ color: '#dc2626' }}>
                  {actionLabels[selectedReportDetail.processAction]}
                  {selectedReportDetail.processMemo && ` / ${selectedReportDetail.processMemo}`}
                </span>
              </div>
            )}

            <div className="report-actions">
              <button className="btn-back" onClick={() => setSelectedReportId(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                목록으로
              </button>
              {selectedReportDetail.status === 'RECEIVED' && (
                <div className="action-buttons">
                  <button className="btn-reject" onClick={handleReject}>
                    반려
                  </button>
                  <button className="btn-approve" onClick={handleProcessClick}>
                    처리
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 신고 처리 모달 */}
      {showProcessModal && (
        <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>신고 처리</h2>
              <p>어떤 항목을 할까 적용할 수 있습니다.</p>
            </div>

            <div className="modal-body">
              <div className="action-checkboxes">
                {(['CONTENT_DELETED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_DELETED'] as ProcessAction[]).map((action) => (
                  <label key={action} className={`action-checkbox ${selectedActions.includes(action) ? 'checked' : ''}`}>
                    <input type="checkbox" checked={selectedActions.includes(action)} onChange={() => toggleAction(action)} />
                    <div className="checkbox-content">
                      <div className="checkbox-title">{actionLabels[action]}</div>
                      <div className="checkbox-desc">
                        {action === 'CONTENT_DELETED' && '피신고 콘텐츠 삭제'}
                        {action === 'ACCOUNT_SUSPENDED' && '피신고 유저 7일 일시 정지 · 팝업 시 메세지 활성화'}
                        {action === 'ACCOUNT_DELETED' && '피신고 유저 강제 탈퇴'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="modal-comment-section">
                <label className="comment-label">내부기록용 메모 작성해 주세요.</label>
                <textarea
                  className="comment-textarea"
                  placeholder="내부 기록용 메모 입력"
                  value={processComment}
                  onChange={(e) => setProcessComment(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowProcessModal(false)}>
                취소
              </button>
              <button className="btn-modal-confirm" onClick={handleProcessConfirm}>
                처리 완료 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

