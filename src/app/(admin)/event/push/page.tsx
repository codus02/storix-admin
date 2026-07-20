'use client'

import { useState } from 'react'

export default function PushNotificationPage() {
  const [filter, setFilter] = useState('ALL')

  // Mock data
  const events = [
    { id: 'APP_EVT_0001', name: '출석 체크 이벤트' },
    { id: 'APP_EVT_0002', name: '첫 구매 리워드 이벤트' },
  ]

  const pushes = [
    {
      id: 'PUSH_0001',
      title: '출석 체크 이벤트 시작!',
      body: '매일 출석하고 리워드 받아가세요',
      appEventId: 'APP_EVT_0001',
      scheduled: '2026-07-01 10:00',
      status: '발송완료',
    },
    {
      id: 'PUSH_0002',
      title: '출석 체크 마감 D-3',
      body: '아직 출석 안 하셨나요?',
      appEventId: 'APP_EVT_0001',
      scheduled: '2026-07-28 12:00',
      status: '예약',
    },
    {
      id: 'PUSH_0003',
      title: '첫 구매하고 리워드 받기',
      body: '첫 결제 시 즉시 적립',
      appEventId: 'APP_EVT_0002',
      scheduled: '2026-06-15 09:00',
      status: '발송완료',
    },
  ]

  const filteredPushes = filter === 'ALL' ? pushes : pushes.filter((p) => p.appEventId === filter)

  const statusClass = (s: string) => ({ '발송완료': 'g', '예약': 'a', '대기': 'n' }[s] || 'n')

  const getEventName = (id: string) => events.find((e) => e.id === id)?.name || '(삭제됨)'

  return (
    <div className="event-page-container">
      <div className="page-head">
        <div>
          <h1>푸시 알림 관리</h1>
          <p className="page-sub">
            각 푸시 알림이 어떤 appEventId에 연결되는지 확인합니다. 클릭 시 targetType=APP_EVENT, targetId=appEventId 로 이벤트 상세 페이지로 이동합니다. ID 칩을 누르면 해당 이벤트로 이동합니다.
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
          <span className="filter-note">전체 {filteredPushes.length}건</span>
        ) : (
          <span className="filter-note">
            <b>{filter}</b> 에 연결된 {filteredPushes.length}건
          </span>
        )}
      </div>

      {filteredPushes.length > 0 ? (
        <div className="event-table-panel">
          <table className="event-table">
            <thead>
              <tr>
                <th>Push ID</th>
                <th>내용</th>
                <th>연결 이벤트</th>
                <th>Payload</th>
                <th>발송 예약</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredPushes.map((p) => (
                <tr key={p.id} className="event-row">
                  <td>
                    <span className="target-mono">
                      <b>{p.id}</b>
                    </span>
                  </td>
                  <td>
                    <div className="ev-name" style={{ fontSize: '13.5px' }}>
                      {p.title}
                    </div>
                    <div className="ev-desc">{p.body}</div>
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
                    <span className="target-mono">
                      targetType=<b>APP_EVENT</b>
                      <br />
                      targetId=<b>{p.appEventId}</b>
                    </span>
                  </td>
                  <td className="period">{p.scheduled}</td>
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
            <h3>연결된 푸시 알림이 없습니다</h3>
            <p>필터를 변경하거나 이벤트 홍보 수단에 해당 채널을 추가해 보세요.</p>
          </div>
        </div>
      )}
    </div>
  )
}
