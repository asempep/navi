import { Link } from 'react-router-dom'
import { MainNavSidebar } from '../components/navConfig'

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function Attendance({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6">
        <MainNavSidebar />
        <div className="min-w-0 flex-1 order-last md:order-none">
          <p className="py-8 text-center text-navi-muted">출석 기록이 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6">
      <MainNavSidebar />
      <div className="min-w-0 flex-1 order-last md:order-none">
    <div className="bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5 mb-4">
      <h2 className="text-xs font-semibold text-navi-muted mb-2">경기별 출석</h2>
      <div className="flex flex-col gap-3">
        {logs.map((row) => (
          <div key={row.matchId} className="pb-3 border-b border-navi-border last:border-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 font-semibold text-xs">
              <span className="text-navi-muted font-normal">{formatDate(row.matchDate)}</span>
              <span>{row.opponent || '상대 미정'}</span>
              <span className="ml-auto text-navi-muted font-medium">총 {row.attendedPlayerNames?.length ?? 0}명 출석</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {row.attendedPlayerNames && row.attendedPlayerNames.length > 0 ? (
                row.attendedPlayerNames.map((name) => (
                  <Link
                    key={name}
                    to={`/player/${encodeURIComponent(name)}`}
                    className="bg-navi-border/20 text-navi-text px-2.5 py-1 rounded-lg text-xs no-underline hover:bg-navi-accent/20 hover:text-navi-accent transition-colors"
                  >
                    {name}
                  </Link>
                ))
              ) : (
                <span className="text-navi-muted text-xs">출석자 없음</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
      </div>
    </div>
  )
}

export default Attendance
