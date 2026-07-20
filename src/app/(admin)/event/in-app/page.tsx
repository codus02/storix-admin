'use client'

import React, { useState } from 'react'

export default function InAppEventPage() {
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - 추후 API 연동
  const events = [
    {
      id: 'APP_EVT_0001',
      name: '출석 체크 이벤트',
      desc: '출석 이벤트용 출석 체크 이벤트',
      start: '2026-07-01 00:00',
      end: '2026-07-31 23:59',
      promo: ['PUSH', 'POPUP', 'BANNER'],
      winner: true,
      status: '진행중',
    },
    {
      id: 'APP_EVT_0002',
      name: '첫 구매 리워드 이벤트',
      desc: '신규 유저 첫 결제 시 적립',
      start: '2026-06-15 00:00',
      end: '2026-07-15 23:59',
      promo: ['PUSH', 'BANNER'],
      winner: false,
      status: '진행중',
    },
  ]

  const pushes = [
    { id: 'PUSH_0001', appEventId: 'APP_EVT_0001', title: '출석 체크 이벤트 시작!', scheduled: '2026-07-01 10:00', status: '발송완료' },
    { id: 'PUSH_0002', appEventId: 'APP_EVT_0001', title: '출석 체크 마감 D-3', scheduled: '2026-07-28 12:00', status: '예약' },
  ]

  const popups = [
    { id: 'POPUP_0001', appEventId: 'APP_EVT_0001', name: '출석 체크 안내 팝업', status: '노출중' },
  ]

  const banners = [
    { id: 'BANNER_0001', appEventId: 'APP_EVT_0001', name: '출석 체크 홈 배너', status: '노출중' },
    { id: 'BANNER_0002', appEventId: 'APP_EVT_0002', name: '첫 구매 리워드 배너', status: '노출중' },
  ]

  const getConnCount = (eventId: string) => ({
    push: pushes.filter((p) => p.appEventId === eventId).length,
    popup: popups.filter((p) => p.appEventId === eventId).length,
    banner: banners.filter((b) => b.appEventId === eventId).length,
  })

  const promoLabel: Record<string, string> = { PUSH: '푸시', POPUP: '팝업', BANNER: '배너' }
  const statusClass = (s: string) => ({'진행중': 'g', '노출중': 'g', '발송완료': 'g', '예약': 'a', '대기': 'a', '종료': 'n'}[s] || 'n')

  const filteredEvents = events.filter(
    (ev) =>
      !searchQuery ||
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="event-page-container">
      <div className="page-head">
        <div>
          <h1>인앱 이벤트 관리</h1>
          <p className="page-sub">
            appEventId가 발급된 이벤트 목록입니다. 행을 클릭하면 해당 이벤트에 연결된 푸시·팝업·배너 현황을 볼 수 있고, 새 이벤트를 만들면 appEventId가 발급됩니다.
          </p>
        </div>
        <button className="btn-primary">
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="filter-note">전체 {filteredEvents.length}건</span>
      </div>

      <div className="event-table-panel">
        <table className="event-table">
          <thead>
            <tr>
              <th>appEventId</th>
              <th>이벤트명</th>
              <th>기간</th>
              <th>홍보 수단</th>
              <th>당첨자</th>
              <th>연결 현황</th>
              <th>상태</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((ev) => {
              const conn = getConnCount(ev.id)
              const isOpen = openRow === ev.id

              return (
                <React.Fragment key={ev.id}>
                  <tr className={`event-row ${isOpen ? 'open' : ''}`} onClick={() => setOpenRow(isOpen ? null : ev.id)}>
                    <td>
                      <span className="id-chip">
                        <span className="dot"></span>
                        {ev.id}
                      </span>
                    </td>
                    <td>
                      <div className="ev-name">{ev.name}</div>
                      <div className="ev-desc">{ev.desc}</div>
                    </td>
                    <td className="period">
                      {ev.start}
                      <span className="dash"> → </span>
                      <br />
                      {ev.end}
                    </td>
                    <td>
                      <div className="promo-tags">
                        {['PUSH', 'POPUP', 'BANNER'].map((p) => (
                          <span key={p} className={`promo-tag ${ev.promo.includes(p) ? 'on' : ''}`}>
                            {promoLabel[p]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {ev.winner ? (
                        <span className="badge a">
                          <span className="bdot"></span>당첨자 O
                        </span>
                      ) : (
                        <span className="badge n">
                          <span className="bdot"></span>없음
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="conn-pills">
                        <span className={`conn-pill ${conn.push > 0 ? 'has' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                          <b>{conn.push}</b>
                        </span>
                        <span className={`conn-pill ${conn.popup > 0 ? 'has' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="14" rx="2" />
                            <path d="M8 21h8" />
                          </svg>
                          <b>{conn.popup}</b>
                        </span>
                        <span className={`conn-pill ${conn.banner > 0 ? 'has' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="7" width="18" height="6" rx="1.5" />
                            <path d="M3 17h18" />
                          </svg>
                          <b>{conn.banner}</b>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusClass(ev.status)}`}>
                        <span className="bdot"></span>
                        {ev.status}
                      </span>
                    </td>
                    <td className="cell-caret">
                      <svg className={`caret ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="detail-row">
                      <td colSpan={8}>
                        <div className="detail-inner">
                          <div className="conn-col">
                            <div className="conn-col-head">
                              <span className="ttl">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                푸시 알림
                              </span>
                              <span className="cnt">{conn.push}</span>
                            </div>
                            <div className="conn-list">
                              {pushes.filter((p) => p.appEventId === ev.id).length > 0 ? (
                                pushes
                                  .filter((p) => p.appEventId === ev.id)
                                  .map((p) => (
                                    <div key={p.id} className="conn-item">
                                      <div className="ci-id">{p.id}</div>
                                      <div className="ci-name">{p.title}</div>
                                      <div className="ci-meta">
                                        <span className={`badge ${statusClass(p.status)}`}>
                                          <span className="bdot"></span>
                                          {p.status}
                                        </span>
                                        <span>· {p.scheduled}</span>
                                      </div>
                                    </div>
                                  ))
                              ) : (
                                <div className="conn-empty">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                  </svg>
                                  <div>연결된 푸시 알림 없음</div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="conn-col">
                            <div className="conn-col-head">
                              <span className="ttl">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="4" width="18" height="14" rx="2" />
                                  <path d="M8 21h8" />
                                </svg>
                                팝업
                              </span>
                              <span className="cnt">{conn.popup}</span>
                            </div>
                            <div className="conn-list">
                              {popups.filter((p) => p.appEventId === ev.id).length > 0 ? (
                                popups
                                  .filter((p) => p.appEventId === ev.id)
                                  .map((p) => (
                                    <div key={p.id} className="conn-item">
                                      <div className="ci-id">{p.id}</div>
                                      <div className="ci-name">{p.name}</div>
                                      <div className="ci-meta">
                                        <span className={`badge ${statusClass(p.status)}`}>
                                          <span className="bdot"></span>
                                          {p.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                              ) : (
                                <div className="conn-empty">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="14" rx="2" />
                                    <path d="M8 21h8" />
                                  </svg>
                                  <div>연결된 팝업 없음</div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="conn-col">
                            <div className="conn-col-head">
                              <span className="ttl">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="7" width="18" height="6" rx="1.5" />
                                  <path d="M3 17h18" />
                                </svg>
                                배너
                              </span>
                              <span className="cnt">{conn.banner}</span>
                            </div>
                            <div className="conn-list">
                              {banners.filter((b) => b.appEventId === ev.id).length > 0 ? (
                                banners
                                  .filter((b) => b.appEventId === ev.id)
                                  .map((b) => (
                                    <div key={b.id} className="conn-item">
                                      <div className="ci-id">{b.id}</div>
                                      <div className="ci-name">{b.name}</div>
                                      <div className="ci-meta">
                                        <span className={`badge ${statusClass(b.status)}`}>
                                          <span className="bdot"></span>
                                          {b.status}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                              ) : (
                                <div className="conn-empty">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="7" width="18" height="6" rx="1.5" />
                                    <path d="M3 17h18" />
                                  </svg>
                                  <div>연결된 배너 없음</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
