'use client'

import { useState } from 'react'

export default function BannerPage() {
  const [filter, setFilter] = useState('ALL')

  // Mock data
  const events = [
    { id: 'APP_EVT_0001', name: '출석 체크 이벤트' },
    { id: 'APP_EVT_0002', name: '첫 구매 리워드 이벤트' },
    { id: 'APP_EVT_0003', name: '여름 시즌 추첨 이벤트' },
  ]

  const banners = [
    {
      id: 'BANNER_0001',
      name: '출석 체크 홈 배너',
      appEventId: 'APP_EVT_0001',
      placement: '홈 탭',
      status: '노출중',
    },
    {
      id: 'BANNER_0002',
      name: '첫 구매 리워드 배너',
      appEventId: 'APP_EVT_0002',
      placement: '홈 탭',
      status: '노출중',
    },
    {
      id: 'BANNER_0003',
      name: '여름 추첨 배너',
      appEventId: 'APP_EVT_0003',
      placement: '홈 탭',
      status: '대기',
    },
  ]

  const filteredBanners = filter === 'ALL' ? banners : banners.filter((b) => b.appEventId === filter)

  const statusClass = (s: string) => ({ '노출중': 'g', '대기': 'a', '종료': 'n' }[s] || 'n')

  const getEventName = (id: string) => events.find((e) => e.id === id)?.name || '(삭제됨)'

  const thumbColor = (id: string) => {
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

  return (
    <div className="event-page-container">
      <div className="page-head">
        <div>
          <h1>배너 관리</h1>
          <p className="page-sub">
            홈 탭 등에 노출되는 배너입니다. 이미지는 AWS S3(public/event/{'{appEventId}'}/banner)에 저장되며, 각 배너가 연결된 appEventId와 노출 위치를 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="select-wrap">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">전체 이벤트</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id} · {e.name}
              </option>
            ))}
          </select>
        </div>
        {filter === 'ALL' ? (
          <span className="filter-note">전체 {filteredBanners.length}건</span>
        ) : (
          <span className="filter-note">
            <b>{filter}</b> 에 연결된 {filteredBanners.length}건
          </span>
        )}
      </div>

      {filteredBanners.length > 0 ? (
        <div className="event-table-panel">
          <table className="event-table">
            <thead>
              <tr>
                <th>Banner ID</th>
                <th>배너 · 이미지(S3)</th>
                <th>연결 이벤트</th>
                <th>노출 위치</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanners.map((b) => (
                <tr key={b.id} className="event-row">
                  <td>
                    <span className="target-mono">
                      <b>{b.id}</b>
                    </span>
                  </td>
                  <td>
                    <div className="thumb">
                      <div className="thumb-box" style={{ background: thumbColor(b.id) }}>
                        BANNER
                      </div>
                      <div className="thumb-meta">
                        <div className="thumb-name">{b.name}</div>
                        <div className="s3path">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7a9 3 0 0 0 18 0M3 7a9 3 0 0 1 18 0M3 7v10a9 3 0 0 0 18 0V7" />
                          </svg>
                          public/event/{b.appEventId}/banner
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="link-ev">
                      <span className="id-chip">
                        <span className="dot"></span>
                        {b.appEventId}
                      </span>
                      <span className="ev-lite">{getEventName(b.appEventId)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge n">
                      <span className="bdot"></span>
                      {b.placement}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusClass(b.status)}`}>
                      <span className="bdot"></span>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="event-table-panel">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a9 3 0 0 0 18 0M3 7a9 3 0 0 1 18 0M3 7v10a9 3 0 0 0 18 0V7" />
            </svg>
            <h3>연결된 배너가 없습니다</h3>
            <p>필터를 변경하거나 이벤트 홍보 수단에 해당 채널을 추가해 보세요.</p>
          </div>
        </div>
      )}
    </div>
  )
}
