import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = String(timeStr).split(':')
  const hour = parseInt(h, 10)
  const minute = m ? parseInt(m, 10) : 0
  if (hour < 12) return `오전 ${hour}:${String(minute).padStart(2, '0')}`
  if (hour === 12) return `오후 12:${String(minute).padStart(2, '0')}`
  return `오후 ${hour - 12}:${String(minute).padStart(2, '0')}`
}

// 결과 필터: null = 전체, '승' | '무' | '패'
const RESULT_FILTERS = [
  { value: null, label: '전체' },
  { value: '승', label: '승' },
  { value: '무', label: '무' },
  { value: '패', label: '패' },
]

// URL의 result 쿼리 값이 승/무/패 중 하나면 반환, 아니면 null (전체)
function getResultFilterFromSearchParams(searchParams) {
  const result = searchParams.get('result')
  return result === '승' || result === '무' || result === '패' ? result : null
}

function AllMatches({ matches }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const resultFilter = useMemo(() => getResultFilterFromSearchParams(searchParams), [searchParams])

  const setResultFilter = (value) => {
    setSearchParams(value != null ? { result: value } : {})
  }

  // 선택한 결과로 경기 목록 필터링 (날짜 최신순 유지)
  const filteredMatches = useMemo(() => {
    if (!matches || matches.length === 0) return []
    if (resultFilter == null) return [...matches]
    return matches.filter((m) => m.result === resultFilter)
  }, [matches, resultFilter])

  const resultClass = (result) => {
    if (result === '승') return 'text-navi-win'
    if (result === '무') return 'text-navi-draw'
    return 'text-navi-lose'
  }

  if (!matches || matches.length === 0) {
    return <p className="py-8 text-center text-navi-muted">등록된 경기가 없습니다.</p>
  }

  return (
    <div className="bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5 mb-4">
      <h2 className="text-sm font-semibold text-navi-muted mb-3">전체 경기</h2>

      {/* 승/무/패 필터 버튼 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {RESULT_FILTERS.map(({ value, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => setResultFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              resultFilter === value
                ? value === '승'
                  ? 'bg-navi-win/20 text-navi-win border border-navi-win/40'
                  : value === '무'
                    ? 'bg-navi-draw/20 text-navi-draw border border-navi-draw/40'
                    : value === '패'
                      ? 'bg-navi-lose/20 text-navi-lose border border-navi-lose/40'
                      : 'bg-navi-button text-white border border-navi-button'
                : 'bg-navi-card text-navi-muted border border-navi-border hover:bg-navi-border/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">경기일</th>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">상대</th>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">스코어</th>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">결과</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-navi-muted">
                  해당 결과의 경기가 없습니다.
                </td>
              </tr>
            ) : (
            filteredMatches.map((m) => (
              <tr key={m.id} className="hover:bg-black/5">
                <td className="py-2 px-3 text-navi-muted text-xs">
                  {formatDate(m.matchDate)}
                  {m.matchTime && <span className="opacity-90 ml-1"> {formatTime(m.matchTime)}</span>}
                </td>
                <td className="py-2 px-3">{m.opponent || '-'}</td>
                <td className="py-2 px-3">{m.ourScore} : {m.opponentScore}</td>
                <td className={`py-2 px-3 ${resultClass(m.result)}`}><strong>{m.result}</strong></td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AllMatches
