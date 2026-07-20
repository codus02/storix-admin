'use client'

import { FormEvent, Fragment, useEffect, useMemo, useState } from 'react'
import {
  cancelAppEvent,
  createAppEvent,
  getAppEvent,
  getAppEvents,
  updateAppEvent,
  type AppEvent,
  type AppEventPayload,
  type AppEventStatus,
  type PromotionType,
} from '@/lib/api/app-event.api'

type FormState = {
  name: string
  description: string
  startAt: string
  endAt: string
  hasWinner: boolean
  promotionTypes: PromotionType[]
}

const emptyForm: FormState = {
  name: '',
  description: '',
  startAt: '',
  endAt: '',
  hasWinner: false,
  promotionTypes: [],
}

const promotionLabels: Record<PromotionType, string> = {
  PUSH: '푸시',
  POPUP: '팝업',
  BANNER: '배너',
}

const statusLabels: Record<AppEventStatus, string> = {
  SCHEDULED: '예약',
  ACTIVE: '진행중',
  ENDED: '종료',
  CANCELED: '강제 종료',
}

const promotionTypes: PromotionType[] = ['PUSH', 'POPUP', 'BANNER']

export default function InAppEventPage() {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          !searchQuery ||
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(event.id).includes(searchQuery),
      ),
    [events, searchQuery],
  )

  const fetchEvents = async (page = currentPage) => {
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await getAppEvents(page)
      if (response.isSuccess) {
        setEvents(response.result.content)
        setCurrentPage(response.result.page)
        setTotalPages(response.result.totalPages)
        setTotalElements(response.result.totalElements)
      }
    } catch {
      setErrorMessage('앱 이벤트 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchEvents(currentPage)
  }, [currentPage])

  const handleSelectEvent = async (appEventId: number) => {
    if (selectedEvent?.id === appEventId) {
      setSelectedEvent(null)
      return
    }

    setDetailLoading(true)
    setErrorMessage('')
    try {
      const response = await getAppEvent(appEventId)
      if (response.isSuccess) {
        setSelectedEvent(response.result)
      }
    } catch {
      setErrorMessage('앱 이벤트 상세를 불러오지 못했습니다.')
    } finally {
      setDetailLoading(false)
    }
  }

  const openCreateModal = () => {
    setForm(emptyForm)
    setModalMode('create')
  }

  const openEditModal = (event: AppEvent) => {
    setForm({
      name: event.name,
      description: event.description,
      startAt: toDatetimeLocalValue(event.startAt),
      endAt: toDatetimeLocalValue(event.endAt),
      hasWinner: event.hasWinner,
      promotionTypes: event.promotionTypes,
    })
    setModalMode('edit')
  }

  const closeModal = () => {
    if (saving) return
    setModalMode(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim() || !form.description.trim() || !form.startAt || !form.endAt) {
      alert('이벤트명, 설명, 시작일시, 종료일시를 모두 입력해주세요.')
      return
    }

    if (form.promotionTypes.length === 0) {
      alert('홍보 수단을 하나 이상 선택해주세요.')
      return
    }

    const payload: AppEventPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      startAt: toIsoString(form.startAt),
      endAt: toIsoString(form.endAt),
      hasWinner: form.hasWinner,
      promotionTypes: form.promotionTypes,
    }

    setSaving(true)
    try {
      if (modalMode === 'edit' && selectedEvent) {
        const response = await updateAppEvent(selectedEvent.id, payload)
        if (response.isSuccess) {
          setSelectedEvent(response.result)
        }
      } else {
        const response = await createAppEvent(payload)
        if (response.isSuccess) {
          setSelectedEvent(response.result)
          setCurrentPage(0)
        }
      }

      setModalMode(null)
      setForm(emptyForm)
      await fetchEvents(modalMode === 'create' ? 0 : currentPage)
    } catch {
      alert(modalMode === 'edit' ? '앱 이벤트 수정에 실패했습니다.' : '앱 이벤트 생성에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEvent = async (event: AppEvent) => {
    const confirmed = window.confirm(`'${event.name}' 이벤트를 강제 종료할까요?`)
    if (!confirmed) return

    try {
      const response = await cancelAppEvent(event.id)
      if (response.isSuccess) {
        setSelectedEvent(response.result)
        await fetchEvents(currentPage)
      }
    } catch {
      alert('앱 이벤트 강제 종료에 실패했습니다.')
    }
  }

  const togglePromotionType = (type: PromotionType) => {
    setForm((current) => ({
      ...current,
      promotionTypes: current.promotionTypes.includes(type)
        ? current.promotionTypes.filter((item) => item !== type)
        : [...current.promotionTypes, type],
    }))
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
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
            onClick={() => setCurrentPage(index)}
            type="button"
          >
            {index + 1}
          </button>
        ))}

        <button
          className="pagination-button"
          onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
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
    <div className="event-page-container">
      <div className="page-head">
        <div>
          <h1>인앱 이벤트 관리</h1>
          <p className="page-sub">
            앱 이벤트를 생성하고 appEventId 기준으로 푸시·팝업·배너 홍보 수단을 연결합니다.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateModal} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5v14" />
          </svg>
          새 이벤트 만들기
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="이벤트명 · appEventId 검색"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <span className="filter-note">전체 {searchQuery ? filteredEvents.length : totalElements}건</span>
      </div>

      {errorMessage ? <p className="login-message">{errorMessage}</p> : null}

      <div className="event-table-panel">
        <table className="event-table">
          <thead>
            <tr>
              <th>appEventId</th>
              <th>이벤트명</th>
              <th>기간</th>
              <th>홍보 수단</th>
              <th>당첨자</th>
              <th>상태</th>
              <th>작업</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>로딩 중...</td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8}>등록된 앱 이벤트가 없습니다.</td>
              </tr>
            ) : (
              filteredEvents.map((event) => {
                const isOpen = selectedEvent?.id === event.id

                return (
                  <Fragment key={event.id}>
                    <tr
                      key={event.id}
                      className={`event-row ${isOpen ? 'open' : ''}`}
                      onClick={() => void handleSelectEvent(event.id)}
                    >
                      <td>
                        <span className="id-chip">
                          <span className="dot"></span>
                          {event.id}
                        </span>
                      </td>
                      <td>
                        <div className="ev-name">{event.name}</div>
                        <div className="ev-desc">{event.description}</div>
                      </td>
                      <td className="period">
                        {formatDateTime(event.startAt)}
                        <span className="dash"> → </span>
                        <br />
                        {formatDateTime(event.endAt)}
                      </td>
                      <td>
                        <div className="promo-tags">
                          {promotionTypes.map((type) => (
                            <span
                              key={type}
                              className={`promo-tag ${event.promotionTypes.includes(type) ? 'on' : ''}`}
                            >
                              {promotionLabels[type]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {event.hasWinner ? (
                          <span className="badge a">당첨자 O</span>
                        ) : (
                          <span className="badge n">없음</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${statusClass(event.status)}`}>
                          {statusLabels[event.status] ?? event.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                          <button className="btn-approve" onClick={() => openEditModal(event)} type="button">
                            수정
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => void handleCancelEvent(event)}
                            disabled={event.status === 'ENDED' || event.status === 'CANCELED'}
                            type="button"
                          >
                            종료
                          </button>
                        </div>
                      </td>
                      <td className="cell-caret">
                        <svg className={`caret ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </td>
                    </tr>
                    {isOpen && selectedEvent ? (
                      <tr className="detail-row" key={`${event.id}-detail`}>
                        <td colSpan={8}>
                          <div className="report-detail-panel">
                            {detailLoading ? (
                              <div>상세 정보를 불러오는 중...</div>
                            ) : (
                              <>
                                <DetailRow label="이벤트명" value={selectedEvent.name} />
                                <DetailRow label="설명" value={selectedEvent.description} />
                                <DetailRow label="시작일시" value={formatDateTime(selectedEvent.startAt)} />
                                <DetailRow label="종료일시" value={formatDateTime(selectedEvent.endAt)} />
                                <DetailRow label="생성일시" value={formatDateTime(selectedEvent.createdAt)} />
                                <DetailRow label="수정일시" value={formatDateTime(selectedEvent.updatedAt)} />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}

      {modalMode ? (
        <div className="modal-overlay" onClick={closeModal}>
          <form className="modal-container" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>{modalMode === 'edit' ? '앱 이벤트 수정' : '새 앱 이벤트 만들기'}</h2>
              <p>앱 이벤트 기본 정보와 연결할 홍보 수단을 입력합니다.</p>
            </div>

            <div className="modal-body">
              <label className="field">
                <span>이벤트명</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>설명</span>
                <input
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>시작 일시</span>
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>종료 일시</span>
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))}
                />
              </label>

              <div className="promotion-selector" aria-label="홍보 수단 선택">
                <span>홍보 수단</span>
                {promotionTypes.map((type) => (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={form.promotionTypes.includes(type)}
                      onChange={() => togglePromotionType(type)}
                    />
                    {promotionLabels[type]}
                  </label>
                ))}
              </div>

              <label className="action-checkbox">
                <input
                  type="checkbox"
                  checked={form.hasWinner}
                  onChange={(event) => setForm((current) => ({ ...current, hasWinner: event.target.checked }))}
                />
                <div className="checkbox-content">
                  <div className="checkbox-title">당첨자 안내 있음</div>
                  <div className="checkbox-desc">이벤트 종료 후 당첨자 안내가 필요한 이벤트입니다.</div>
                </div>
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={closeModal} disabled={saving} type="button">
                취소
              </button>
              <button className="btn-modal-confirm" disabled={saving} type="submit">
                {saving ? '저장 중...' : modalMode === 'edit' ? '수정 완료' : '이벤트 생성'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="report-detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('ko-KR')
}

function toDatetimeLocalValue(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function toIsoString(value: string) {
  return new Date(value).toISOString()
}

function statusClass(status: AppEventStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'g'
    case 'ENDED':
    case 'CANCELED':
      return 'a'
    case 'SCHEDULED':
    default:
      return 'n'
  }
}
