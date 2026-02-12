import { useState, useMemo } from 'react'
import { MainNavSidebar } from '../components/navConfig'
import {
  HomeWinDrawLossCompact,
  HomeNextMatches,
  HomeGoalsVsConceded,
  HomeGoalRanking,
  HomeMonthlyMatchesChart,
  HomeAttendanceChart,
  HomeAssistRanking,
  HomeAttendanceRanking,
  HomePlayerList,
} from '../components/Home'

/**
 * 홈: 대시보드형 메인 화면
 * - 각 섹션은 components/Home/ 에서 분리 관리
 */
function Home({ data, matches = [], attendanceLogs = [] }) {
  const [openSections, setOpenSections] = useState({
    goals: true,
    assists: true,
    attendance: true,
    players: false,
  })

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!data) return <p className="py-8 text-center text-navi-muted">데이터가 없습니다.</p>

  const { seasonStats, nextMatches = [], goalRanking, assistRanking, attendanceRanking } = data

  // 팀 총 득점 / 총 실점 (막대 차트용)
  const totalGoals = useMemo(() => goalRanking.reduce((sum, r) => sum + (r.value || 0), 0), [goalRanking])
  const totalGoalsConceded = useMemo(
    () => matches.reduce((sum, m) => sum + (Number(m.opponentScore) || 0), 0),
    [matches]
  )
  const maxGoalConceded = Math.max(totalGoals, totalGoalsConceded, 1)

  // 득점 순위 상위 5명
  const topGoals = goalRanking.slice(0, 5)

  // 승/무/패 비율 (도넛)
  const total = seasonStats.totalMatches || 1
  const winPct = (seasonStats.wins / total) * 100
  const drawPct = (seasonStats.draws / total) * 100
  const lossPct = (seasonStats.losses / total) * 100

  // 선수 명단 (골/도움/출석 통합)
  const playerNames = useMemo(
    () =>
      [...new Set([...goalRanking.map((r) => r.playerName), ...assistRanking.map((r) => r.playerName), ...attendanceRanking.map((r) => r.playerName)])].sort((a, b) =>
        a.localeCompare(b, 'ko')
      ),
    [goalRanking, assistRanking, attendanceRanking]
  )
  const getPlayerStats = (name) => ({
    attendance: attendanceRanking.find((r) => r.playerName === name)?.value ?? 0,
    goals: goalRanking.find((r) => r.playerName === name)?.value ?? 0,
    assists: assistRanking.find((r) => r.playerName === name)?.value ?? 0,
  })

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6">
      <MainNavSidebar />

      <div className="min-w-0 flex-1 flex flex-col gap-4 lg:gap-6 order-last md:order-none">
        {/* 상단: 총 경기 승무패 한 칸 (비율 적게) */}
        <HomeWinDrawLossCompact seasonStats={seasonStats} winPct={winPct} drawPct={drawPct} lossPct={lossPct} />

        {/* 핵심 지표: 득점 / 도움 / 출석 순위 3단 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <HomeGoalRanking topGoals={topGoals} isOpen={openSections.goals} onToggle={() => toggleSection('goals')} />
          <HomeAssistRanking assistRanking={assistRanking} isOpen={openSections.assists} onToggle={() => toggleSection('assists')} />
          <HomeAttendanceRanking attendanceRanking={attendanceRanking} isOpen={openSections.attendance} onToggle={() => toggleSection('attendance')} />
        </div>

        {/* 그 아래: 나머지 콘텐츠 3열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="flex flex-col gap-4">
            <HomeNextMatches nextMatches={nextMatches} />
            <HomeGoalsVsConceded totalGoals={totalGoals} totalGoalsConceded={totalGoalsConceded} maxGoalConceded={maxGoalConceded} />
          </div>
          <div className="flex flex-col gap-4">
            <HomeMonthlyMatchesChart matches={matches} />
            <HomeAttendanceChart attendanceLogs={attendanceLogs} />
          </div>
          <div className="flex flex-col gap-4">
            <HomePlayerList playerNames={playerNames} getPlayerStats={getPlayerStats} isOpen={openSections.players} onToggle={() => toggleSection('players')} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
