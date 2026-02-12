function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function Goals({ logs }) {
  if (!logs || logs.length === 0) {
    return <p className="py-8 text-center text-navi-muted">골 기록이 없습니다.</p>
  }

  return (
    <div className="bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5 mb-4">
      <h2 className="text-sm font-semibold text-navi-muted mb-3">골 / 도움 기록</h2>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">경기일</th>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">상대</th>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">선수</th>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">골</th>
              <th className="text-left py-2 px-3 text-navi-muted font-semibold">도움</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row, idx) => (
              <tr key={idx} className="hover:bg-black/5">
                <td className="py-2 px-3 text-navi-muted text-xs">{formatDate(row.matchDate)}</td>
                <td className="py-2 px-3">{row.opponent || '-'}</td>
                <td className="py-2 px-3 font-semibold">{row.playerName}</td>
                <td className="py-2 px-3"><strong>{row.goals}</strong></td>
                <td className="py-2 px-3">{row.assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Goals
