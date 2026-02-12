import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

/**
 * 홈: 대시보드형 메인 화면
 * - 상단 요약 카드 4개 (총 경기, 승, 무, 패)
 * - 득점 vs 도움 막대 비교
 * - 득점 순위 테이블 (인기도 바)
 * - 승/무/패 비율 도넛
 * - 다음 경기, 월별 경기 추이, 선수 명단
 */
function Home({ data, matches = [] }) {
  const [openSections, setOpenSections] = useState({
    goals: true,
    assists: false,
    attendance: false,
    players: false,
  })

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!data) return <p className="py-8 text-center text-navi-muted">데이터가 없습니다.</p>

  const { seasonStats, nextMatches = [], goalRanking, assistRanking, attendanceRanking } = data

  // 팀 총 득점 / 총 도움 (막대 차트용)
  const totalGoals = useMemo(() => goalRanking.reduce((sum, r) => sum + (r.value || 0), 0), [goalRanking])
  const totalAssists = useMemo(() => assistRanking.reduce((sum, r) => sum + (r.value || 0), 0), [assistRanking])
  const maxGoalAssist = Math.max(totalGoals, totalAssists, 1)

  // 득점 순위 인기도(최대 골 대비 비율) — 상위 5명
  const topGoals = goalRanking.slice(0, 5)
  const maxGoalInTop = Math.max(...topGoals.map((r) => r.value), 1)

  // 승/무/패 비율 (도넛 차트)
  const total = seasonStats.totalMatches || 1
  const winPct = (seasonStats.wins / total) * 100
  const drawPct = (seasonStats.draws / total) * 100
  const lossPct = (seasonStats.losses / total) * 100

  // 월별 경기 수 (matches: { matchDate } 형태 가정)
  const monthlyCounts = useMemo(() => {
    const map = {}
    for (let m = 1; m <= 12; m++) map[m] = 0
    matches.forEach((m) => {
      const date = m.matchDate
      if (!date) return
      const month = typeof date === 'string' ? parseInt(date.slice(5, 7), 10) : date.month || 1
      if (month >= 1 && month <= 12) map[month] = (map[month] || 0) + 1
    })
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({ month: m, count: map[m] || 0 }))
  }, [matches])
  const maxMonthly = Math.max(...monthlyCounts.map((x) => x.count), 1)
  const monthLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  const playerNames = [...new Set([
    ...goalRanking.map((r) => r.playerName),
    ...assistRanking.map((r) => r.playerName),
    ...attendanceRanking.map((r) => r.playerName),
  ])].sort((a, b) => a.localeCompare(b, 'ko'))

  const getPlayerStats = (name) => ({
    attendance: attendanceRanking.find((r) => r.playerName === name)?.value ?? 0,
    goals: goalRanking.find((r) => r.playerName === name)?.value ?? 0,
    assists: assistRanking.find((r) => r.playerName === name)?.value ?? 0,
  })

  const formatMatchTime = (time) => {
    if (typeof time !== 'string') return time ?? ''
    return time.slice(0, 5)
  }

  const cardBase = 'bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5'
  const cardTitle = 'text-sm font-semibold text-navi-muted mb-3'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* 1열: 요약 카드 4개 + 득점 vs 도움 + 득점 순위 */}
      <div className="flex flex-col gap-4">
        <section className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className={`${cardBase} flex flex-col gap-1`}>
            <span className="text-navi-muted text-sm">총 경기</span>
            <span className="text-2xl font-bold text-navi-text">{seasonStats.totalMatches}</span>
            <span className="text-xs text-navi-muted">시즌 {seasonStats.seasonYear}</span>
          </div>
          <div className={`${cardBase} flex flex-col gap-1`}>
            <span className="text-navi-muted text-sm">승</span>
            <span className="text-2xl font-bold text-navi-win">{seasonStats.wins}</span>
            <span className="text-xs text-navi-muted">승률 {total ? Math.round((seasonStats.wins / total) * 100) : 0}%</span>
          </div>
          <div className={`${cardBase} flex flex-col gap-1`}>
            <span className="text-navi-muted text-sm">무</span>
            <span className="text-2xl font-bold text-navi-draw">{seasonStats.draws}</span>
            <span className="text-xs text-navi-muted">무승부</span>
          </div>
          <div className={`${cardBase} flex flex-col gap-1`}>
            <span className="text-navi-muted text-sm">패</span>
            <span className="text-2xl font-bold text-navi-lose">{seasonStats.losses}</span>
            <span className="text-xs text-navi-muted">패배</span>
          </div>
        </section>

        <section className={cardBase}>
          <h2 className={cardTitle}>득점 vs 도움</h2>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs text-navi-muted mb-1">
                <span>득점</span>
                <span>{totalGoals}골</span>
              </div>
              <div className="h-6 bg-navi-bg rounded overflow-hidden">
                <div
                  className="h-full bg-navi-accent rounded transition-all duration-500"
                  style={{ width: `${(totalGoals / maxGoalAssist) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-navi-muted mb-1">
                <span>도움</span>
                <span>{totalAssists}도움</span>
              </div>
              <div className="h-6 bg-navi-bg rounded overflow-hidden">
                <div
                  className="h-full bg-navi-button rounded transition-all duration-500"
                  style={{ width: `${(totalAssists / maxGoalAssist) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-navi-muted">
            <span>• 득점</span>
            <span>• 도움</span>
          </div>
        </section>

        <section className={cardBase}>
          <h2 className={cardTitle}>득점 순위</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-2 text-navi-muted font-semibold w-10">#</th>
                  <th className="text-left py-2 px-2 text-navi-muted font-semibold">선수</th>
                  <th className="text-left py-2 px-2 text-navi-muted font-semibold w-24">인기도</th>
                  <th className="text-right py-2 px-2 text-navi-muted font-semibold w-14">골</th>
                </tr>
              </thead>
              <tbody>
                {topGoals.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-navi-muted">기록 없음</td></tr>
                ) : (
                  topGoals.map((r) => (
                    <tr key={r.rank} className="hover:bg-white/5">
                      <td className="py-2 px-2 font-semibold text-navi-accent">{r.rank}</td>
                      <td className="py-2 px-2">
                        <Link to={`/player/${encodeURIComponent(r.playerName)}`} className="text-navi-accent no-underline hover:underline">
                          {r.playerName}
                        </Link>
                      </td>
                      <td className="py-2 px-2">
                        <div className="h-2 bg-navi-bg rounded overflow-hidden min-w-[60px]">
                          <div
                            className="h-full bg-navi-accent rounded"
                            style={{ width: `${(r.value / maxGoalInTop) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2">
            <Link to="/goals" className="text-xs text-navi-accent hover:underline">전체 득점 순위 →</Link>
          </div>
        </section>
      </div>

      {/* 2열: 승/무/패 도넛, 다음 경기, 월별 경기 수 */}
      <div className="flex flex-col gap-4">
        <section className={cardBase}>
          <h2 className={cardTitle}>승/무/패 비율</h2>
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-navi-bg)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="var(--color-navi-win)"
                  strokeWidth="3"
                  strokeDasharray={`${winPct} ${100 - winPct}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="var(--color-navi-draw)"
                  strokeWidth="3"
                  strokeDasharray={`${drawPct} ${100 - drawPct}`}
                  strokeDashoffset={-winPct}
                  strokeLinecap="round"
                />
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="var(--color-navi-lose)"
                  strokeWidth="3"
                  strokeDasharray={`${lossPct} ${100 - lossPct}`}
                  strokeDashoffset={-(winPct + drawPct)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-bold text-navi-text">{seasonStats.totalMatches}경기</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-navi-win" />승 {seasonStats.wins}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-navi-draw" />무 {seasonStats.draws}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-navi-lose" />패 {seasonStats.losses}</span>
            </div>
          </div>
        </section>

        <section className={cardBase}>
          <h2 className={cardTitle}>다음 경기</h2>
          {nextMatches.length === 0 ? (
            <p className="py-4 text-center text-navi-muted text-sm">등록된 다음 경기가 없습니다.</p>
          ) : (
            <ul className="list-none p-0 m-0 space-y-2">
              {nextMatches.slice(0, 3).map((m) => (
                <li key={m.id} className="py-2 border-b border-navi-border last:border-0 text-sm">
                  <span className="font-semibold text-navi-accent">{m.matchDate}</span>
                  {m.matchTime != null && <span className="ml-2 text-navi-muted">{formatMatchTime(m.matchTime)}</span>}
                  <span className="block font-semibold text-navi-text">vs {m.opponent}</span>
                  {m.venue && <span className="text-navi-muted text-xs">{m.venue}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {matches.length > 0 && (
          <section className={cardBase}>
            <h2 className={cardTitle}>월별 경기 수</h2>
            <div className="flex items-end gap-1 h-24">
              {monthlyCounts.map(({ month, count }) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-navi-text text-xs font-medium" style={{ height: count > 0 ? 'auto' : 0 }}>{count > 0 ? count : ''}</span>
                  <div
                    className="w-full bg-navi-button rounded-t min-h-[4px] transition-all duration-500"
                    style={{ height: `${(count / maxMonthly) * 80}px` }}
                  />
                  <span className="text-navi-muted text-[10px] truncate w-full text-center">{monthLabels[month - 1]}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 3열: 도움 순위, 출석 순위, 선수 명단 */}
      <div className="flex flex-col gap-4">
        <section className={cardBase}>
          <button
            type="button"
            className="w-full flex items-center justify-between p-0 m-0 border-0 bg-transparent font-inherit text-inherit cursor-pointer text-left"
            onClick={() => toggleSection('assists')}
            aria-expanded={openSections.assists}
          >
            <h2 className={cardTitle + ' mb-0'}>도움 순위</h2>
            <span className="text-navi-muted text-xs">{openSections.assists ? '▼' : '▶'}</span>
          </button>
          {openSections.assists && (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold">#</th>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold">선수</th>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold">도움</th>
                  </tr>
                </thead>
                <tbody>
                  {assistRanking.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 text-center text-navi-muted">기록 없음</td></tr>
                  ) : (
                    assistRanking.slice(0, 5).map((r) => (
                      <tr key={r.rank} className="hover:bg-white/5">
                        <td className="py-2 px-2 font-semibold text-navi-accent">{r.rank}</td>
                        <td className="py-2 px-2">
                          <Link to={`/player/${encodeURIComponent(r.playerName)}`} className="text-navi-accent no-underline hover:underline">{r.playerName}</Link>
                        </td>
                        <td className="py-2 px-2 font-semibold">{r.value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={cardBase}>
          <button
            type="button"
            className="w-full flex items-center justify-between p-0 m-0 border-0 bg-transparent font-inherit text-inherit cursor-pointer text-left"
            onClick={() => toggleSection('attendance')}
            aria-expanded={openSections.attendance}
          >
            <h2 className={cardTitle + ' mb-0'}>출석 순위</h2>
            <span className="text-navi-muted text-xs">{openSections.attendance ? '▼' : '▶'}</span>
          </button>
          {openSections.attendance && (
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold">#</th>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold">선수</th>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold">출석</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRanking.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 text-center text-navi-muted">기록 없음</td></tr>
                  ) : (
                    attendanceRanking.slice(0, 5).map((r) => (
                      <tr key={r.rank} className="hover:bg-white/5">
                        <td className="py-2 px-2 font-semibold text-navi-accent">{r.rank}</td>
                        <td className="py-2 px-2">
                          <Link to={`/player/${encodeURIComponent(r.playerName)}`} className="text-navi-accent no-underline hover:underline">{r.playerName}</Link>
                        </td>
                        <td className="py-2 px-2 font-semibold">{r.value}회</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={cardBase}>
          <button
            type="button"
            className="w-full flex items-center justify-between p-0 m-0 border-0 bg-transparent font-inherit text-inherit cursor-pointer text-left"
            onClick={() => toggleSection('players')}
            aria-expanded={openSections.players}
          >
            <h2 className={cardTitle + ' mb-0'}>선수 명단</h2>
            <span className="text-navi-muted text-xs">{openSections.players ? '▼' : '▶'}</span>
          </button>
          {openSections.players && (
            <ul className="list-none p-0 m-0 max-h-48 overflow-y-auto">
              {playerNames.length === 0 ? (
                <li className="py-2 text-navi-muted text-sm">등록된 선수 없음</li>
              ) : (
                playerNames.map((name) => {
                  const stats = getPlayerStats(name)
                  return (
                    <li key={name} className="py-1.5 border-b border-navi-border last:border-0 min-h-[40px] flex items-center relative group">
                      <Link to={`/player/${encodeURIComponent(name)}`} className="text-navi-accent no-underline hover:underline text-sm">
                        {name}
                      </Link>
                      <div className="absolute left-0 bottom-full mb-1 px-2 py-1.5 bg-navi-card border border-navi-border rounded text-xs shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                        출석 {stats.attendance}회 · 골 {stats.goals} · 도움 {stats.assists}
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default Home
