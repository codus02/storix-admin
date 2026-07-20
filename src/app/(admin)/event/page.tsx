const events = [
  {
    id: 'EVT-2026-001',
    name: '출석 체크 이벤트',
    description: '출시 이벤트용 출석 체크 이벤트',
    period: '2026.07.10 00:00 - 2026.07.31 23:59',
    promotion: ['푸시', '팝업', '배너'],
    status: '진행 예정',
  },
  {
    id: 'EVT-2026-002',
    name: '여름 리뷰 챌린지',
    description: '신규 리뷰 작성 유도 캠페인',
    period: '2026.07.01 00:00 - 2026.07.20 23:59',
    promotion: ['배너'],
    status: '진행 중',
  },
  {
    id: 'EVT-2026-003',
    name: '신규 가입자 웰컴 이벤트',
    description: '신규 유저 온보딩 참여 보상',
    period: '2026.06.01 00:00 - 2026.06.30 23:59',
    promotion: ['푸시', '팝업'],
    status: '종료',
  },
]

const promotionCards = [
  {
    title: '푸시 알림',
    target: 'targetType: APP_EVENT',
    path: 'targetId: appEventId',
    detail: '예약 발송 시간과 링크 대상 이벤트를 설정합니다.',
  },
  {
    title: '팝업',
    target: 'S3: public/event/{appEventId}/popup',
    path: '앱 진입 시 노출',
    detail: '팝업 이미지와 오늘 다시 보지 않기 옵션을 등록합니다.',
  },
  {
    title: '배너',
    target: 'S3: public/event/{appEventId}/banner',
    path: '홈 탭 배너 영역',
    detail: '홈 화면에 노출할 이벤트 배너 이미지를 연결합니다.',
  },
]

export default function EventPage() {
  return (
    <div className="event-page">
      <header className="event-header">
        <div>
          <p className="event-eyebrow">APP EVENT</p>
          <h1>이벤트 관리</h1>
        </div>
        <button className="primary-button" type="button">
          앱 이벤트 등록
        </button>
      </header>

      <section className="event-summary-grid" aria-label="이벤트 요약">
        <SummaryCard label="전체 이벤트" value="12" helper="최근 30일 기준" />
        <SummaryCard label="진행 중" value="3" helper="앱 노출 중" />
        <SummaryCard label="예약 발송" value="5" helper="푸시 알림 대기" />
        <SummaryCard label="이미지 검수" value="2" helper="팝업/배너 확인 필요" />
      </section>

      <section className="event-workspace">
        <article className="event-panel event-form-panel">
          <div className="panel-heading">
            <div>
              <h2>앱 이벤트 등록</h2>
              <p>appEventId 발급에 필요한 기본 정보를 입력합니다.</p>
            </div>
            <span className="panel-badge">Draft</span>
          </div>

          <div className="event-form-grid">
            <label className="field wide">
              <span>앱 이벤트 명</span>
              <input defaultValue="출석 체크 이벤트" />
            </label>
            <label className="field wide">
              <span>앱 이벤트 간단 설명</span>
              <input defaultValue="출시 이벤트용 출석 체크 이벤트" />
            </label>
            <label className="field">
              <span>시작 일시</span>
              <input defaultValue="2026-07-10 00:00" />
            </label>
            <label className="field">
              <span>종료 일시</span>
              <input defaultValue="2026-07-31 23:59" />
            </label>
            <label className="field">
              <span>이벤트 참여 방식</span>
              <select defaultValue="attendance">
                <option value="attendance">출석 체크</option>
                <option value="review">리뷰 작성</option>
                <option value="custom">직접 설정</option>
              </select>
            </label>
            <label className="field">
              <span>당첨자 안내</span>
              <select defaultValue="push">
                <option value="push">푸시 알림</option>
                <option value="none">없음</option>
              </select>
            </label>
          </div>

          <div className="promotion-selector" aria-label="홍보 수단 선택">
            <span>홍보 수단</span>
            <label>
              <input type="checkbox" defaultChecked /> 푸시 알림
            </label>
            <label>
              <input type="checkbox" defaultChecked /> 팝업
            </label>
            <label>
              <input type="checkbox" defaultChecked /> 배너
            </label>
          </div>

          <div className="event-url-preview">
            <span>이벤트 상세 URL</span>
            <strong>https://storix.kr/event/{'{appEventId}'}</strong>
          </div>
        </article>

        <aside className="event-panel event-flow-panel">
          <div className="panel-heading compact">
            <h2>등록 흐름</h2>
          </div>
          <ol className="event-flow-list">
            <li>
              <span>1</span>
              <p>앱 이벤트 등록 후 appEventId를 발급합니다.</p>
            </li>
            <li>
              <span>2</span>
              <p>푸시, 팝업, 배너 등록 시 appEventId를 연결합니다.</p>
            </li>
            <li>
              <span>3</span>
              <p>사용자는 앱에서 이벤트 상세 WebView로 이동합니다.</p>
            </li>
            <li>
              <span>4</span>
              <p>종료 후 당첨자 안내 푸시를 발송합니다.</p>
            </li>
          </ol>
        </aside>
      </section>

      <section className="event-panel">
        <div className="panel-heading list-heading">
          <div>
            <h2>앱 이벤트 목록</h2>
            <p>등록된 이벤트와 연결된 홍보 수단을 확인합니다.</p>
          </div>
          <div className="event-controls">
            <select defaultValue="all">
              <option value="all">전체 상태</option>
              <option value="ready">진행 예정</option>
              <option value="active">진행 중</option>
              <option value="closed">종료</option>
            </select>
            <input placeholder="이벤트명 검색" />
          </div>
        </div>

        <table className="event-table">
          <thead>
            <tr>
              <th>appEventId</th>
              <th>이벤트명</th>
              <th>기간</th>
              <th>홍보 수단</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="mono">{event.id}</td>
                <td>
                  <strong>{event.name}</strong>
                  <span>{event.description}</span>
                </td>
                <td>{event.period}</td>
                <td>
                  <div className="chip-row">
                    {event.promotion.map((item) => (
                      <span className="chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${getStatusClassName(event.status)}`}>
                    {event.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="promotion-grid">
        {promotionCards.map((card) => (
          <article className="event-panel promotion-card" key={card.title}>
            <div className="panel-heading compact">
              <h2>{card.title} 등록</h2>
            </div>
            <div className="promotion-card-body">
              <p>{card.detail}</p>
              <dl>
                <div>
                  <dt>연결 기준</dt>
                  <dd>{card.target}</dd>
                </div>
                <div>
                  <dt>노출 위치</dt>
                  <dd>{card.path}</dd>
                </div>
              </dl>
              <button className="secondary-button" type="button">
                등록 화면 열기
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  )
}

function getStatusClassName(status: string) {
  if (status === '진행 중') return 'active'
  if (status === '종료') return 'closed'
  return 'ready'
}
