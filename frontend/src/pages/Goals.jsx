import { useMemo, useState } from 'react'
import { MainNavSidebar } from '../components/navConfig'

const FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'goals', label: '골' },
  { value: 'assists', label: '도움' },
]

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function Goals({ logs }) {
  const [filter, setFilter] = useState('all')

  const filteredLogs = useMemo(() => {
    if (!logs || logs.length === 0) return []
    if (filter === 'all') return logs
    if (filter === 'goals') return logs.filter((row) => (row.goals ?? 0) > 0)
    return logs.filter((row) => (row.assists ?? 0) > 0)
  }, [logs, filter])

  const isEmpty = !logs || logs.length === 0
  const hasNoFiltered = !isEmpty && filteredLogs.length === 0

  const emptyMessage = isEmpty
    ? '골·도움 기록이 없습니다.'
    : hasNoFiltered
      ? (filter === 'goals' ? '골 기록이 없습니다.' : '도움 기록이 없습니다.')
      : null

  if (isEmpty) {
    return (
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6">
        <MainNavSidebar />
        <div className="min-w-0 flex-1 order-last md:order-none">
          <p className="py-8 text-center text-navi-muted">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6">
      <MainNavSidebar />
      <div className="min-w-0 flex-1 order-last md:order-none">
        <div className="bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5 mb-4">
          <h2 className="text-sm font-semibold text-navi-muted mb-3">골 / 도움 기록</h2>

          {/* 필터: 전체 / 골 / 도움 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === value
                    ? 'bg-navi-button text-white border border-navi-button'
                    : 'bg-navi-bg text-navi-muted border border-navi-border hover:bg-navi-border/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {hasNoFiltered ? (
            <p className="py-8 text-center text-navi-muted">{emptyMessage}</p>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 sm:px-3 text-navi-muted font-semibold whitespace-nowrap">경기일</th>
                    <th className="text-left py-2 px-2 sm:px-3 text-navi-muted font-semibold whitespace-nowrap">상대</th>
                    <th className="text-left py-2 px-2 sm:px-3 text-navi-muted font-semibold whitespace-nowrap">선수</th>
                    <th className="text-left py-2 px-2 sm:px-3 text-navi-muted font-semibold whitespace-nowrap">골</th>
                    <th className="text-left py-2 px-2 sm:px-3 text-navi-muted font-semibold whitespace-nowrap">도움</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((row, idx) => (
                    <tr key={idx} className="hover:bg-black/5">
                      <td className="py-2 px-2 sm:px-3 text-navi-muted whitespace-nowrap">{formatDate(row.matchDate)}</td>
                      <td className="py-2 px-2 sm:px-3 whitespace-nowrap">{row.opponent || '-'}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold whitespace-nowrap">{row.playerName}</td>
                      <td className="py-2 px-2 sm:px-3 whitespace-nowrap"><strong>{row.goals}</strong></td>
                      <td className="py-2 px-2 sm:px-3 whitespace-nowrap">{row.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Goals
