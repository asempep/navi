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

function AllMatches({ matches }) {
  if (!matches || matches.length === 0) {
    return <p className="py-8 text-center text-navi-muted">등록된 경기가 없습니다.</p>
  }

  const resultClass = (result) => {
    if (result === '승') return 'text-navi-win'
    if (result === '무') return 'text-navi-draw'
    return 'text-navi-lose'
  }

  return (
    <div className="bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5 mb-4">
      <h2 className="text-sm font-semibold text-navi-muted mb-3">전체 경기</h2>
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
            {matches.map((m) => (
              <tr key={m.id} className="hover:bg-white/5">
                <td className="py-2 px-3 text-navi-muted text-xs">
                  {formatDate(m.matchDate)}
                  {m.matchTime && <span className="opacity-90 ml-1"> {formatTime(m.matchTime)}</span>}
                </td>
                <td className="py-2 px-3">{m.opponent || '-'}</td>
                <td className="py-2 px-3">{m.ourScore} : {m.opponentScore}</td>
                <td className={`py-2 px-3 ${resultClass(m.result)}`}><strong>{m.result}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AllMatches
