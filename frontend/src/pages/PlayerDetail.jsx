import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPlayerDetail } from '../api'

/**
 * 선수 상세 정보 페이지: 출석, 골, 어시, 전화번호 (URL: /player/:name)
 */
function PlayerDetail() {
  const { name } = useParams()
  const playerName = name ? decodeURIComponent(name) : ''
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!playerName) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchPlayerDetail(playerName)
        if (!cancelled) {
          setDetail(data)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [playerName])

  const backLink = <Link to="/home" className="player-detail-back">← 홈으로</Link>

  if (!playerName) {
    return (
      <div className="player-detail">
        {backLink}
        <p className="empty">선수 이름이 없습니다.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="player-detail">
        {backLink}
        <p className="loading">로딩 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="player-detail">
        {backLink}
        <p className="error">{error}</p>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="player-detail">
        {backLink}
        <p className="empty">해당 선수를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const matchRecords = detail.matchRecords || []

  return (
    <div className="player-detail">
      {backLink}
      <section className="card player-detail-card">
        <h2 className="player-detail-name">{detail.playerName}</h2>
        <dl className="player-detail-stats">
          <div className="player-detail-row">
            <dt>출석</dt>
            <dd><strong>{detail.attendance}</strong>회</dd>
          </div>
          <div className="player-detail-row">
            <dt>골</dt>
            <dd><strong>{detail.goals}</strong></dd>
          </div>
          <div className="player-detail-row">
            <dt>어시</dt>
            <dd><strong>{detail.assists}</strong></dd>
          </div>
          <div className="player-detail-row">
            <dt>전화번호</dt>
            <dd>{detail.phoneNumber || '—'}</dd>
          </div>
        </dl>
      </section>
      {matchRecords.length > 0 && (
        <section className="card player-detail-matches">
          <h2>참가한 경기</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>경기일</th>
                  <th>상대</th>
                  <th>골</th>
                  <th>어시</th>
                </tr>
              </thead>
              <tbody>
                {matchRecords.map((r) => (
                  <tr key={r.matchId}>
                    <td>{r.matchDate}</td>
                    <td>{r.opponent}</td>
                    <td><strong>{r.goals}</strong></td>
                    <td><strong>{r.assists}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default PlayerDetail
