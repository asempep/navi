/**
 * 골 탭: 경기별 골/도움 로그 (골 위주)
 */
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function Goals({ logs }) {
  if (!logs || logs.length === 0) {
    return <p className="empty">골 기록이 없습니다.</p>
  }

  return (
    <div className="card">
      <h2>골 / 도움 기록</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>경기일</th>
              <th>상대</th>
              <th>선수</th>
              <th>골</th>
              <th>도움</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row, idx) => (
              <tr key={idx} className="log-row">
                <td className="date">{formatDate(row.matchDate)}</td>
                <td>{row.opponent || '-'}</td>
                <td className="player">{row.playerName}</td>
                <td><strong>{row.goals}</strong></td>
                <td>{row.assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Goals
