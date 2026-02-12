import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPlayerDetail } from '../api'

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
        if (!cancelled) setDetail(data)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [playerName])

  const backLink = (
    <Link to="/home" className="inline-block py-2 mb-4 text-navi-accent no-underline hover:opacity-80 transition-opacity text-sm">
      ← 홈으로
    </Link>
  )

  const card = 'bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5'

  if (!playerName) {
    return (
      <div className="max-w-md mx-auto py-4">
        {backLink}
        <p className="py-8 text-center text-navi-muted">선수 이름이 없습니다.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-4">
        {backLink}
        <p className="py-8 text-center text-navi-muted">로딩 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-4">
        {backLink}
        <p className="py-8 text-center text-red-500">{error}</p>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="max-w-md mx-auto py-4">
        {backLink}
        <p className="py-8 text-center text-navi-muted">해당 선수를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const matchRecords = detail.matchRecords || []

  return (
    <div className="max-w-md mx-auto py-4">
      {backLink}
      <section className={`${card} mb-4`}>
        <h2 className="text-xl font-bold text-navi-text mb-4">{detail.playerName}</h2>
        <dl className="flex flex-col gap-3 m-0">
          {[
            { label: '출석', value: <><strong>{detail.attendance}</strong>회</> },
            { label: '골', value: <strong>{detail.goals}</strong> },
            { label: '어시', value: <strong>{detail.assists}</strong> },
            { label: '전화번호', value: detail.phoneNumber || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-navi-border last:border-0">
              <dt className="m-0 text-sm text-navi-muted">{label}</dt>
              <dd className="m-0 text-base">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {matchRecords.length > 0 && (
        <section className={card}>
          <h2 className="text-sm font-semibold text-navi-muted mb-3">참가한 경기</h2>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">경기일</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">상대</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">골</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">어시</th>
                </tr>
              </thead>
              <tbody>
                {matchRecords.map((r) => (
                  <tr key={r.matchId} className="hover:bg-black/5">
                    <td className="py-2 px-3">{r.matchDate}</td>
                    <td className="py-2 px-3">{r.opponent}</td>
                    <td className="py-2 px-3"><strong>{r.goals}</strong></td>
                    <td className="py-2 px-3"><strong>{r.assists}</strong></td>
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
