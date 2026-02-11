/**
 * 출석 탭: 경기별 출석 선수 목록
 */
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function Attendance({ logs }) {
  if (!logs || logs.length === 0) {
    return <p className="empty">출석 기록이 없습니다.</p>
  }

  return (
    <div className="card">
      <h2>경기별 출석</h2>
      <div className="attendance-list">
        {logs.map((row) => (
          <div key={row.matchId} className="attendance-item">
            <div className="attendance-header">
              <span className="date">{formatDate(row.matchDate)}</span>
              <span>{row.opponent || '상대 미정'}</span>
              <span className="attendance-count">총 {row.attendedPlayerNames?.length ?? 0}명 출석</span>
            </div>
            <div className="attendance-names">
              {row.attendedPlayerNames && row.attendedPlayerNames.length > 0 ? (
                row.attendedPlayerNames.map((name) => (
                  <span key={name}>{name}</span>
                ))
              ) : (
                <span className="empty">출석자 없음</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Attendance
