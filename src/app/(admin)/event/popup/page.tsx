'use client'

import { useState } from 'react'

export default function PopupPage() {
  const [filter, setFilter] = useState('ALL')

  // Mock data
  const events = [
    { id: 'APP_EVT_0001', name: '출석 체크 이벤트' },
    { id: 'APP_EVT_0003', name: '여름 시즌 추첨 이벤트' },
  ]

  const popups = [
    {
      id: 'POPUP_0001',
      name: '출석 체크 안내 팝업',
      appEventId: 'APP_EVT_0001',
      hideToday: true,
      status: '노출중',
    },
    {
      id: 'POPUP_0002',
      name: '여름 추첨 티저 팝업',
      appEventId: 'APP_EVT_0003',
      hideToday: true,
      status: '대기',
    },
  ]

  const filteredPopups = filter === 'ALL' ? popups : popups.filter((p) => p.appEventId === filter)

  const statusClass = (s: string) => ({ '노출중': 'g', '대기': 'a', '종료': 'n' }[s] || 'n')

  const getEventName = (id: string) => events.find((e) => e.id === id)?.name || '(삭제됨)'

  const thumbColor = (id: string) => {
    const colors = [
      ['#EC1E79', '#B60E5A'],
      ['#3457C4', '#22368A'],
      ['#0E9F6E', '#0A7A54'],
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
          <h1>팝업 관리</h1>
          <p className="page-sub">
            앱 진입 시 노출되는 팝업입니다. 이미지는 AWS S3(public/event/{'{appEventId}'}/popup)에 저장되며, 각 팝업이 연결된 appEventId를 확인할 수 있습니다.
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
          <span className="filter-note">전체 {filteredPopups.length}건</span>
        ) : (
          <span className="filter-note">
            <b>{filter}</b> 에 연결된 {filteredPopups.length}건
          </span>
        )}
      </div>

      {filteredPopups.length > 0 ? (
        <div className="event-table-panel">
          <table className="event-table">
            <thead>
              <tr>
                <th>Popup ID</th>
                <th>팝업 · 이미지(S3)</th>
                <th>연결 이벤트</th>
                <th>오늘 다시 보지 않기</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredPopups.map((p) => (
                <tr key={p.id} className="event-row">
                  <td>
                    <span className="target-mono">
                      <b>{p.id}</b>
                    </span>
                  </td>
                  <td>
                    <div className="thumb">
                      <div className="thumb-box" style={{ background: thumbColor(p.id) }}>
                        POPUP
                      </div>
                      <div className="thumb-meta">
                        <div className="thumb-name">{p.name}</div>
                        <div className="s3path">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7a9 3 0 0 0 18 0M3 7a9 3 0 0 1 18 0M3 7v10a9 3 0 0 0 18 0V7" />
                          </svg>
                          public/event/{p.appEventId}/popup
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="link-ev">
                      <span className="id-chip">
                        <span className="dot"></span>
                        {p.appEventId}
                      </span>
                      <span className="ev-lite">{getEventName(p.appEventId)}</span>
                    </div>
                  </td>
                  <td>
                    {p.hideToday ? (
                      <span className="badge g">
                        <span className="bdot"></span>사용
                      </span>
                    ) : (
                      <span className="badge n">
                        <span className="bdot"></span>미사용
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${statusClass(p.status)}`}>
                      <span className="bdot"></span>
                      {p.status}
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
            <h3>연결된 팝업이 없습니다</h3>
            <p>필터를 변경하거나 이벤트 홍보 수단에 해당 채널을 추가해 보세요.</p>
          </div>
        </div>
      )}
    </div>
  )
}
