function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function Attendance({ logs }) {
  if (!logs || logs.length === 0) {
    return <p className="py-8 text-center text-navi-muted">출석 기록이 없습니다.</p>
  }

  return (
    <div className="bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5 mb-4">
      <h2 className="text-sm font-semibold text-navi-muted mb-3">경기별 출석</h2>
      <div className="flex flex-col gap-4">
        {logs.map((row) => (
          <div key={row.matchId} className="pb-4 border-b border-navi-border last:border-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 font-semibold">
              <span className="text-navi-muted font-normal">{formatDate(row.matchDate)}</span>
              <span>{row.opponent || '상대 미정'}</span>
              <span className="ml-auto text-navi-muted font-medium">총 {row.attendedPlayerNames?.length ?? 0}명 출석</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {row.attendedPlayerNames && row.attendedPlayerNames.length > 0 ? (
                row.attendedPlayerNames.map((name) => (
                  <span key={name} className="bg-navi-bg px-2 py-1 rounded-md text-sm">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-navi-muted text-sm">출석자 없음</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Attendance
