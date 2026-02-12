import { useState, useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'

/**
 * 홈: 대시보드형 메인 화면
 * - 상단 요약 카드 4개 (총 경기, 승, 무, 패)
 * - 득점 vs 실점 막대 비교
 * - 득점 순위 테이블 (인기도 바)
 * - 승/무/패 비율 도넛
 * - 다음 경기, 월별 경기 추이, 선수 명단
 */
function Home({ data, matches = [], attendanceLogs = [] }) {
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

  // 팀 총 득점 / 총 실점 (막대 차트용 — 실점 = 경기별 상대 득점 합)
  const totalGoals = useMemo(() => goalRanking.reduce((sum, r) => sum + (r.value || 0), 0), [goalRanking])
  const totalGoalsConceded = useMemo(
    () => matches.reduce((sum, m) => sum + (Number(m.opponentScore) || 0), 0),
    [matches]
  )
  const maxGoalConceded = Math.max(totalGoals, totalGoalsConceded, 1)

  // 득점 순위 인기도(최대 골 대비 비율) — 상위 5명
  const topGoals = goalRanking.slice(0, 5)
  const maxGoalInTop = Math.max(...topGoals.map((r) => r.value), 1)

  // 승/무/패 비율 (도넛 차트)
  const total = seasonStats.totalMatches || 1
  const winPct = (seasonStats.wins / total) * 100
  const drawPct = (seasonStats.draws / total) * 100
  const lossPct = (seasonStats.losses / total) * 100

  // 날짜 문자열 → "몇월.몇일일" (예: 1.11일, 1.18일)
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return ''
    if (typeof dateStr !== 'string') return ''
    const m = parseInt(dateStr.slice(5, 7), 10)
    const d = parseInt(dateStr.slice(8, 10), 10)
    return `${m}.${d}일`
  }

  // 월별 경기 수 (1~12월, 월별 집계)
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

  // 경기당 출석 인원 수: 출석 로그를 경기일 기준 정렬, 일자별 출석 인원
  const attendanceByDate = useMemo(() => {
    const sorted = [...attendanceLogs].filter((r) => r.matchDate).sort((a, b) => (a.matchDate || '').localeCompare(b.matchDate || ''))
    return sorted.map((row) => ({
      dateStr: row.matchDate,
      label: formatDateLabel(row.matchDate),
      count: row.attendedPlayerNames?.length ?? 0,
    }))
  }, [attendanceLogs])
  const maxAttendance = Math.max(...attendanceByDate.map((x) => x.count), 1)
  const nAttendance = attendanceByDate.length

  // 라인 차트 공통 크기
  const chartW = 320
  const chartH = 140
  const padLeft = 36
  const padRight = 12
  const padTop = 14
  const padBottom = 28
  const plotW = chartW - padLeft - padRight
  const plotH = chartH - padTop - padBottom

  // 월별 경기 수 차트: x는 1~12월, y는 해당 월 경기 수
  const monthlyPoints = useMemo(() => {
    return monthlyCounts.map(({ month, count }, i) => ({
      x: padLeft + (plotW / 11) * i,
      y: padTop + plotH - (count / maxMonthly) * plotH,
      month,
      count,
    }))
  }, [monthlyCounts, maxMonthly])

  const smoothPathMonthly = useMemo(() => {
    const pts = monthlyPoints
    if (pts.length < 2) return ''
    const to = (p) => `${p.x} ${p.y}`
    let d = `M ${to(pts[0])}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${to(p2)}`
    }
    return d
  }, [monthlyPoints])

  // 경기당 출석 차트: x는 일자 인덱스, y는 해당 경기 출석 인원
  const attendancePoints = useMemo(() => {
    if (nAttendance === 0) return []
    const divisor = nAttendance > 1 ? nAttendance - 1 : 1
    return attendanceByDate.map(({ label, count }, i) => ({
      x: padLeft + (plotW / divisor) * i,
      y: padTop + plotH - (count / maxAttendance) * plotH,
      label,
      count,
    }))
  }, [attendanceByDate, maxAttendance, nAttendance])

  const smoothPathAttendance = useMemo(() => {
    const pts = attendancePoints
    if (pts.length < 2) return pts.length === 1 ? `M ${pts[0].x} ${pts[0].y}` : ''
    const to = (p) => `${p.x} ${p.y}`
    let d = `M ${to(pts[0])}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${to(p2)}`
    }
    return d
  }, [attendancePoints])

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

  // 바디 상단 버튼 공통 스타일 (크기 통일)
  const btnBase = 'inline-flex items-center justify-center min-h-[36px] px-2 py-1.5 rounded-md border text-sm font-medium no-underline transition-colors shrink-0'
  const btnActive = 'bg-navi-button border-navi-button text-white'
  const btnInactive = 'bg-navi-bg border-navi-border text-navi-text hover:bg-navi-border hover:border-navi-button'

  const tabs = [
    { path: '/home', label: '홈', end: true },
    { path: '/matches', label: '전체 경기', end: false },
    { path: '/goals', label: '골', end: false },
    { path: '/assists', label: '도움', end: false },
    { path: '/attendance', label: '출석', end: false },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6">
      {/* 모바일: 상단 3x3 버튼 그리드 / 데스크톱: 좌측 세로 메뉴 */}
      <nav
        className="grid grid-cols-3 gap-1.5 md:flex md:flex-col md:gap-2 shrink-0 w-full md:w-auto md:min-w-[140px] order-first md:order-none"
        aria-label="메인 메뉴 및 링크"
      >
        {tabs.map((t) => (
          <NavLink
            key={t.path}
            to={t.path}
            end={t.end}
            isActive={t.end ? (_, loc) => loc.pathname === '/home' : undefined}
            className={({ isActive }) =>
              `${btnBase} min-h-[32px] px-1.5 py-1 text-xs md:min-h-[36px] md:px-2 md:py-1.5 md:text-sm w-full justify-center ${isActive ? btnActive : btnInactive}`
            }
          >
            {t.label}
          </NavLink>
        ))}
        <a href="https://res.isdc.co.kr/index.do" target="_blank" rel="noopener noreferrer" className={`${btnBase} min-h-[32px] px-1.5 py-1 text-xs md:min-h-[36px] md:px-2 md:py-1.5 md:text-sm w-full justify-center ${btnInactive}`}>
          구장예약
        </a>
        <a href="https://www.youtube.com/@NatusVincere-mn3qc" target="_blank" rel="noopener noreferrer" className={`${btnBase} min-h-[32px] px-1.5 py-1 text-xs md:min-h-[36px] md:px-2 md:py-1.5 md:text-sm w-full justify-center ${btnInactive}`}>
          유튜브
        </a>
        <a href="https://www.instagram.com/fc_natusvincere?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className={`${btnBase} min-h-[32px] px-1.5 py-1 text-xs md:min-h-[36px] md:px-2 md:py-1.5 md:text-sm w-full justify-center ${btnInactive}`}>
          인스타
        </a>
        <Link to="/admin" className={`${btnBase} min-h-[32px] px-1.5 py-1 text-xs md:min-h-[36px] md:px-2 md:py-1.5 md:text-sm w-full justify-center ${btnInactive}`}>
          관리
        </Link>
      </nav>

      {/* 대시보드: 모바일에서 메인 영역으로 표시 */}
      <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 order-last md:order-none">
      {/* 1열: 요약 카드 4개 + 다음 경기 + 득점 vs 실점 + 득점 순위 */}
      <div className="flex flex-col gap-4">
        <section className="grid grid-cols-2 gap-2 sm:gap-3">
          <Link to="/matches" className={`${cardBase} flex flex-col gap-1 no-underline text-inherit hover:border-navi-accent/50 transition-colors cursor-pointer`}>
            <span className="text-navi-muted text-sm">총 경기</span>
            <span className="text-2xl font-bold text-navi-text">{seasonStats.totalMatches}</span>
            <span className="text-xs text-navi-muted">시즌 {seasonStats.seasonYear}</span>
          </Link>
          <Link to="/matches?result=승" className={`${cardBase} flex flex-col gap-1 no-underline text-inherit hover:border-navi-win/50 transition-colors cursor-pointer`}>
            <span className="text-navi-muted text-sm">승</span>
            <span className="text-2xl font-bold text-navi-win">{seasonStats.wins}</span>
            <span className="text-xs text-navi-muted">승률 {total ? Math.round((seasonStats.wins / total) * 100) : 0}%</span>
          </Link>
          <Link to="/matches?result=무" className={`${cardBase} flex flex-col gap-1 no-underline text-inherit hover:border-navi-draw/50 transition-colors cursor-pointer`}>
            <span className="text-navi-muted text-sm">무</span>
            <span className="text-2xl font-bold text-navi-draw">{seasonStats.draws}</span>
            <span className="text-xs text-navi-muted">무승부</span>
          </Link>
          <Link to="/matches?result=패" className={`${cardBase} flex flex-col gap-1 no-underline text-inherit hover:border-navi-lose/50 transition-colors cursor-pointer`}>
            <span className="text-navi-muted text-sm">패</span>
            <span className="text-2xl font-bold text-navi-lose">{seasonStats.losses}</span>
            <span className="text-xs text-navi-muted">패배</span>
          </Link>
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

        <section className={cardBase}>
          <h2 className={cardTitle}>득점 vs 실점</h2>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs text-navi-muted mb-1">
                <span>득점</span>
                <span>{totalGoals}골</span>
              </div>
              <div className="h-6 bg-navi-bg rounded overflow-hidden">
                <div
                  className="h-full bg-navi-accent rounded transition-all duration-500"
                  style={{ width: `${(totalGoals / maxGoalConceded) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-navi-muted mb-1">
                <span>실점</span>
                <span>{totalGoalsConceded}골</span>
              </div>
              <div className="h-6 bg-navi-bg rounded overflow-hidden">
                <div
                  className="h-full bg-navi-lose/70 rounded transition-all duration-500"
                  style={{ width: `${(totalGoalsConceded / maxGoalConceded) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-navi-muted">
            <span>• 득점</span>
            <span>• 실점</span>
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
                  <th className="text-left py-2 px-2 text-navi-muted font-semibold w-24" />
                  <th className="text-right py-2 px-2 text-navi-muted font-semibold w-14">골</th>
                </tr>
              </thead>
              <tbody>
                {topGoals.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-navi-muted">기록 없음</td></tr>
                ) : (
                  topGoals.map((r) => (
                    <tr key={r.rank} className="hover:bg-black/5">
                      <td className="py-2 px-2 font-semibold text-navi-accent">{r.rank}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <Link to={`/player/${encodeURIComponent(r.playerName)}`} className="text-xs text-navi-accent no-underline hover:underline">
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

      {/* 2열: 승/무/패 도넛, 월별 경기 수 */}
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

        {matches.length > 0 && (
          <section className={cardBase}>
            <h2 className={cardTitle}>월별 경기 수</h2>
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[140px] min-w-[280px]" preserveAspectRatio="xMidYMid meet">
                {/* 세로 그리드선: 12개월 */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                  <line
                    key={i}
                    x1={padLeft + (plotW / 11) * i}
                    y1={padTop}
                    x2={padLeft + (plotW / 11) * i}
                    y2={padTop + plotH}
                    stroke="var(--color-navi-border)"
                    strokeOpacity={0.4}
                    strokeWidth={0.5}
                  />
                ))}
                {[0, 0.25, 0.5, 0.75, 1].map((r) => (
                  <line
                    key={r}
                    x1={padLeft}
                    y1={padTop + plotH * (1 - r)}
                    x2={padLeft + plotW}
                    y2={padTop + plotH * (1 - r)}
                    stroke="var(--color-navi-border)"
                    strokeOpacity={0.4}
                    strokeWidth={0.5}
                  />
                ))}
                <path
                  d={smoothPathMonthly}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* X축: 1월~12월 */}
                {monthLabels.map((label, i) => (
                  <text
                    key={label}
                    x={padLeft + (plotW / 11) * i}
                    y={chartH - 8}
                    textAnchor="middle"
                    style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}
                  >
                    {label.replace('월', '')}
                  </text>
                ))}
                {maxMonthly > 0 && (
                  <text x={padLeft - 6} y={padTop + 4} textAnchor="end" style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}>{maxMonthly}</text>
                )}
                <text x={padLeft - 6} y={padTop + plotH + 4} textAnchor="end" style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}>0</text>
              </svg>
            </div>
          </section>
        )}

        {/* 경기당 출석 인원 수: 가로축 = 경기 일자(몇월.몇일) */}
        {nAttendance > 0 && (
          <section className={cardBase}>
            <h2 className={cardTitle}>경기당 출석 인원 수</h2>
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[140px] min-w-[280px]" preserveAspectRatio="xMidYMid meet">
                {attendancePoints.map((pt, i) => (
                  <line
                    key={i}
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + plotH}
                    stroke="var(--color-navi-border)"
                    strokeOpacity={0.4}
                    strokeWidth={0.5}
                  />
                ))}
                {[0, 0.25, 0.5, 0.75, 1].map((r) => (
                  <line
                    key={r}
                    x1={padLeft}
                    y1={padTop + plotH * (1 - r)}
                    x2={padLeft + plotW}
                    y2={padTop + plotH * (1 - r)}
                    stroke="var(--color-navi-border)"
                    strokeOpacity={0.4}
                    strokeWidth={0.5}
                  />
                ))}
                <path
                  d={smoothPathAttendance}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {attendancePoints.map((pt, i) => (
                  <text
                    key={`${pt.label}-${i}`}
                    x={pt.x}
                    y={chartH - 8}
                    textAnchor="middle"
                    style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}
                  >
                    {pt.label}
                  </text>
                ))}
                {maxAttendance > 0 && (
                  <text x={padLeft - 6} y={padTop + 4} textAnchor="end" style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}>{maxAttendance}</text>
                )}
                <text x={padLeft - 6} y={padTop + plotH + 4} textAnchor="end" style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}>0</text>
              </svg>
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
                      <tr key={r.rank} className="hover:bg-black/5">
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
                      <tr key={r.rank} className="hover:bg-black/5">
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
    </div>
  )
}

export default Home
