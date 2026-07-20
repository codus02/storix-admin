'use client'

import { FormEvent, Fragment, useEffect, useState } from 'react'
import {
  cancelAdminBanner,
  createAdminBanner,
  getAdminBanner,
  getAdminBanners,
  updateAdminBanner,
  type AdminBanner,
  type AdminBannerPayload,
  type BannerContentTargetType,
  type BannerStatus,
} from '@/lib/api/banner.api'

type FormState = {
  targetId: string
  contentTargetType: BannerContentTargetType
  bannerTitle: string
  displayStartAt: string
  displayEndAt: string
  file: File | null
}

const emptyForm: FormState = {
  targetId: '',
  contentTargetType: 'APP_EVENT',
  bannerTitle: '',
  displayStartAt: '',
  displayEndAt: '',
  file: null,
}

const statusLabels: Record<BannerStatus, string> = {
  SCHEDULED: '예약',
  ACTIVE: '노출중',
  ENDED: '종료',
  CANCELED: '강제 종료',
}

const targetTypeLabels: Record<BannerContentTargetType, string> = {
  APP_EVENT: '앱 이벤트',
}

export default function BannerPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([])
  const [selectedBanner, setSelectedBanner] = useState<AdminBanner | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const fetchBanners = async (page = currentPage, keyword = appliedKeyword) => {
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await getAdminBanners(page, keyword.trim() || undefined)
      if (response.isSuccess) {
        setBanners(response.result.content)
        setCurrentPage(response.result.page)
        setTotalPages(response.result.totalPages)
        setTotalElements(response.result.totalElements)
      }
    } catch {
      setErrorMessage('배너 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchBanners(currentPage, appliedKeyword)
  }, [currentPage, appliedKeyword])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCurrentPage(0)
    setAppliedKeyword(searchQuery)
  }

  const handleSelectBanner = async (bannerId: number) => {
    if (selectedBanner?.id === bannerId) {
      setSelectedBanner(null)
      return
    }

    setDetailLoading(true)
    setErrorMessage('')
    try {
      const response = await getAdminBanner(bannerId)
      if (response.isSuccess) {
        setSelectedBanner(response.result)
      }
    } catch {
      setErrorMessage('배너 상세를 불러오지 못했습니다.')
    } finally {
      setDetailLoading(false)
    }
  }

  const openCreateModal = () => {
    setForm(emptyForm)
    setModalMode('create')
  }

  const openEditModal = async (bannerId: number) => {
    const detail =
      selectedBanner?.id === bannerId
        ? selectedBanner
        : (await getAdminBanner(bannerId)).result

    setSelectedBanner(detail)
    setForm({
      targetId: String(detail.targetId),
      contentTargetType: detail.contentTargetType,
      bannerTitle: detail.bannerTitle,
      displayStartAt: toDatetimeLocalValue(detail.displayStartAt),
      displayEndAt: toDatetimeLocalValue(detail.displayEndAt),
      file: null,
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

    if (!form.targetId.trim() || !form.bannerTitle.trim() || !form.displayStartAt || !form.displayEndAt) {
      alert('타겟 ID, 배너명, 노출 기간을 모두 입력해주세요.')
      return
    }

    if (modalMode === 'create' && !form.file) {
      alert('배너 이미지를 선택해주세요.')
      return
    }

    const payload: AdminBannerPayload = {
      targetId: Number(form.targetId),
      contentTargetType: form.contentTargetType,
      bannerTitle: form.bannerTitle.trim(),
      displayStartAt: toIsoString(form.displayStartAt),
      displayEndAt: toIsoString(form.displayEndAt),
    }

    setSaving(true)
    try {
      if (modalMode === 'edit' && selectedBanner) {
        const response = await updateAdminBanner(selectedBanner.id, payload, form.file)
        if (response.isSuccess) {
          setSelectedBanner(response.result)
        }
      } else if (form.file) {
        const response = await createAdminBanner(payload, form.file)
        if (response.isSuccess) {
          setSelectedBanner(response.result)
          setCurrentPage(0)
        }
      }

      setModalMode(null)
      setForm(emptyForm)
      await fetchBanners(modalMode === 'create' ? 0 : currentPage, appliedKeyword)
    } catch {
      alert(modalMode === 'edit' ? '배너 수정에 실패했습니다.' : '배너 생성에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelBanner = async (banner: AdminBanner) => {
    const confirmed = window.confirm(`'${banner.bannerTitle}' 배너를 강제 종료할까요?`)
    if (!confirmed) return

    try {
      const response = await cancelAdminBanner(banner.id)
      if (response.isSuccess) {
        setSelectedBanner(response.result)
        await fetchBanners(currentPage, appliedKeyword)
      }
    } catch {
      alert('배너 강제 종료에 실패했습니다.')
    }
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
          <h1>배너 관리</h1>
          <p className="page-sub">
            홈 탭 등에 노출되는 이벤트 배너를 생성하고 노출 기간과 이미지를 관리합니다.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateModal} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5v14" />
          </svg>
          새 배너 만들기
        </button>
      </div>

      <form className="toolbar" onSubmit={handleSearchSubmit}>
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="배너명 검색"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <button className="btn-approve" type="submit">
          검색
        </button>
        {appliedKeyword ? (
          <button
            className="btn-reject"
            onClick={() => {
              setSearchQuery('')
              setAppliedKeyword('')
              setCurrentPage(0)
            }}
            type="button"
          >
            초기화
          </button>
        ) : null}
        <span className="filter-note">전체 {totalElements}건</span>
      </form>

      {errorMessage ? <p className="login-message">{errorMessage}</p> : null}

      <div className="event-table-panel">
        <table className="event-table">
          <thead>
            <tr>
              <th>Banner ID</th>
              <th>배너 · 이미지</th>
              <th>연결 대상</th>
              <th>노출 기간</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>로딩 중...</td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan={6}>등록된 배너가 없습니다.</td>
              </tr>
            ) : (
              banners.map((banner) => {
                const isOpen = selectedBanner?.id === banner.id

                return (
                  <Fragment key={banner.id}>
                    <tr
                      className={`event-row ${isOpen ? 'open' : ''}`}
                      onClick={() => void handleSelectBanner(banner.id)}
                    >
                      <td>
                        <span className="id-chip">
                          <span className="dot"></span>
                          {banner.id}
                        </span>
                      </td>
                      <td>
                        <div className="thumb">
                          {banner.imageUrl ? (
                            <img className="thumb-box" src={banner.imageUrl} alt="" />
                          ) : (
                            <div className="thumb-box" style={{ background: thumbColor(String(banner.id)) }}>
                              BANNER
                            </div>
                          )}
                          <div className="thumb-meta">
                            <div className="thumb-name">{banner.bannerTitle}</div>
                            <div className="s3path">public/event/{banner.targetId}/banner</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="link-ev">
                          <span className="id-chip">
                            <span className="dot"></span>
                            {banner.targetId}
                          </span>
                          <span className="ev-lite">{targetTypeLabels[banner.contentTargetType]}</span>
                        </div>
                      </td>
                      <td className="period">
                        {formatDateTime(banner.displayStartAt)}
                        <span className="dash"> → </span>
                        <br />
                        {formatDateTime(banner.displayEndAt)}
                      </td>
                      <td>
                        <span className={`badge ${statusClass(banner.status)}`}>
                          {statusLabels[banner.status] ?? banner.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                          <button className="btn-approve" onClick={() => void openEditModal(banner.id)} type="button">
                            수정
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => void handleCancelBanner(banner)}
                            disabled={banner.status === 'ENDED' || banner.status === 'CANCELED'}
                            type="button"
                          >
                            종료
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && selectedBanner ? (
                      <tr className="detail-row">
                        <td colSpan={6}>
                          <div className="report-detail-panel">
                            {detailLoading ? (
                              <div>상세 정보를 불러오는 중...</div>
                            ) : (
                              <>
                                {selectedBanner.imageUrl ? (
                                  <img
                                    src={selectedBanner.imageUrl}
                                    alt=""
                                    style={{ maxWidth: 360, borderRadius: 8, border: '1px solid #ebebef' }}
                                  />
                                ) : null}
                                <DetailRow label="배너명" value={selectedBanner.bannerTitle} />
                                <DetailRow label="대상" value={`${targetTypeLabels[selectedBanner.contentTargetType]} ${selectedBanner.targetId}`} />
                                <DetailRow label="노출 시작" value={formatDateTime(selectedBanner.displayStartAt)} />
                                <DetailRow label="노출 종료" value={formatDateTime(selectedBanner.displayEndAt)} />
                                <DetailRow label="생성일시" value={formatDateTime(selectedBanner.createdAt)} />
                                <DetailRow label="수정일시" value={formatDateTime(selectedBanner.updatedAt)} />
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
              <h2>{modalMode === 'edit' ? '배너 수정' : '새 배너 만들기'}</h2>
              <p>연결할 앱 이벤트, 노출 기간과 배너 이미지를 입력합니다.</p>
            </div>

            <div className="modal-body">
              <label className="field">
                <span>연결 앱 이벤트 ID</span>
                <input
                  type="number"
                  value={form.targetId}
                  onChange={(event) => setForm((current) => ({ ...current, targetId: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>대상 유형</span>
                <select
                  value={form.contentTargetType}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, contentTargetType: event.target.value as BannerContentTargetType }))
                  }
                >
                  <option value="APP_EVENT">앱 이벤트</option>
                </select>
              </label>
              <label className="field">
                <span>배너명</span>
                <input
                  value={form.bannerTitle}
                  onChange={(event) => setForm((current) => ({ ...current, bannerTitle: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>노출 시작</span>
                <input
                  type="datetime-local"
                  value={form.displayStartAt}
                  onChange={(event) => setForm((current) => ({ ...current, displayStartAt: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>노출 종료</span>
                <input
                  type="datetime-local"
                  value={form.displayEndAt}
                  onChange={(event) => setForm((current) => ({ ...current, displayEndAt: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>{modalMode === 'edit' ? '이미지 변경' : '배너 이미지'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))
                  }
                />
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={closeModal} disabled={saving} type="button">
                취소
              </button>
              <button className="btn-modal-confirm" disabled={saving} type="submit">
                {saving ? '저장 중...' : modalMode === 'edit' ? '수정 완료' : '배너 생성'}
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

function statusClass(status: BannerStatus) {
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

function thumbColor(id: string) {
  const colors = [
    ['#EC1E79', '#B60E5A'],
    ['#3457C4', '#22368A'],
    ['#0E9F6E', '#0A7A54'],
    ['#C77700', '#95590A'],
  ]
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const [a, b] = colors[h % colors.length]
  return `linear-gradient(135deg,${a},${b})`
}
