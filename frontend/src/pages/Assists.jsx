/**
 * 도움 탭: 경기별 도움/골 로그
 */
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function Assists({ logs }) {
  if (!logs || logs.length === 0) {
    return <p className="empty">도움 기록이 없습니다.</p>
  }

  return (
    <div className="card">
      <h2>도움 / 골 기록</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>경기일</th>
              <th>상대</th>
              <th>선수</th>
              <th>도움</th>
              <th>골</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row, idx) => (
              <tr key={idx} className="log-row">
                <td className="date">{formatDate(row.matchDate)}</td>
                <td>{row.opponent || '-'}</td>
                <td className="player">{row.playerName}</td>
                <td><strong>{row.assists}</strong></td>
                <td>{row.goals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Assists
