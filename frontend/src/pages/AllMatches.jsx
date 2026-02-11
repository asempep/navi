/**
 * 전체 경기 목록
 */
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** 경기 시간 표시 (HH:mm 또는 HH:mm:ss → "오후 2:30" 형태) */
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
    return <p className="empty">등록된 경기가 없습니다.</p>
  }

  const resultClass = (result) => {
    if (result === '승') return 'result-win'
    if (result === '무') return 'result-draw'
    return 'result-lose'
  }

  return (
    <div className="card">
      <h2>전체 경기</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>경기일</th>
              <th>상대</th>
              <th>스코어</th>
              <th>결과</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td className="date">
                  {formatDate(m.matchDate)}
                  {m.matchTime && <span className="match-time"> {formatTime(m.matchTime)}</span>}
                </td>
                <td>{m.opponent || '-'}</td>
                <td>{m.ourScore} : {m.opponentScore}</td>
                <td className={resultClass(m.result)}><strong>{m.result}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AllMatches
