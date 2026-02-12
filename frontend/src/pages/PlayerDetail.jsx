import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPlayerDetail } from '../api'
import { MainNavSidebar } from '../components/navConfig'

const pageLayout = (content) => (
  <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6">
    <MainNavSidebar />
    <div className="min-w-0 flex-1 order-last md:order-none max-w-md mx-auto py-4 w-full">
      {content}
    </div>
  </div>
)

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

  const card = 'bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5'

  if (!playerName) {
    return pageLayout(<p className="py-8 text-center text-navi-muted">선수 이름이 없습니다.</p>)
  }

  if (loading) {
    return pageLayout(<p className="py-8 text-center text-navi-muted">로딩 중...</p>)
  }

  if (error) {
    return pageLayout(<p className="py-8 text-center text-red-500">{error}</p>)
  }

  if (!detail) {
    return pageLayout(<p className="py-8 text-center text-navi-muted">해당 선수를 찾을 수 없습니다.</p>)
  }

  const matchRecords = detail.matchRecords || []

  return pageLayout(
    <>
      <section className={`${card} mb-4`}>
        <h2 className="text-lg font-bold text-navi-text mb-3">{detail.playerName}</h2>
        <dl className="flex flex-col gap-2 m-0">
          {[
            { label: '출석', value: <><strong>{detail.attendance}</strong>회</> },
            { label: '골', value: <strong>{detail.goals}</strong> },
            { label: '어시', value: <strong>{detail.assists}</strong> },
            { label: '전화번호', value: detail.phoneNumber || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-navi-border last:border-0">
              <dt className="m-0 text-xs text-navi-muted">{label}</dt>
              <dd className="m-0 text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {matchRecords.length > 0 && (
        <section className={card}>
          <h2 className="text-xs font-semibold text-navi-muted mb-2">참가한 경기</h2>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1.5 px-2 text-navi-muted font-semibold whitespace-nowrap">경기일</th>
                  <th className="text-left py-1.5 px-2 text-navi-muted font-semibold whitespace-nowrap">상대</th>
                  <th className="text-left py-1.5 px-2 text-navi-muted font-semibold whitespace-nowrap">골</th>
                  <th className="text-left py-1.5 px-2 text-navi-muted font-semibold whitespace-nowrap">어시</th>
                </tr>
              </thead>
              <tbody>
                {matchRecords.map((r) => (
                  <tr key={r.matchId} className="hover:bg-black/5">
                    <td className="py-1.5 px-2 whitespace-nowrap">{r.matchDate}</td>
                    <td className="py-1.5 px-2 whitespace-nowrap">{r.opponent}</td>
                    <td className="py-1.5 px-2 whitespace-nowrap"><strong>{r.goals}</strong></td>
                    <td className="py-1.5 px-2 whitespace-nowrap"><strong>{r.assists}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}

export default PlayerDetail
