import { Link } from 'react-router-dom'
import { CARD_BASE } from './cardStyles'

/** 홈 1열: 총 경기 / 승 / 무 / 패 요약 카드 4개 */
export default function HomeSummaryCards({ seasonStats, total }) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:gap-3">
      <Link to="/matches" className={`${CARD_BASE} flex flex-col gap-1 no-underline text-inherit hover:border-navi-accent/50 transition-colors cursor-pointer`}>
        <span className="text-navi-muted text-sm">총 경기</span>
        <span className="text-2xl font-bold text-navi-text">{seasonStats.totalMatches}</span>
        <span className="text-xs text-navi-muted">시즌 {seasonStats.seasonYear}</span>
      </Link>
      <Link to="/matches?result=승" className={`${CARD_BASE} flex flex-col gap-1 no-underline text-inherit hover:border-navi-win/50 transition-colors cursor-pointer`}>
        <span className="text-navi-muted text-sm">승</span>
        <span className="text-2xl font-bold text-navi-win">{seasonStats.wins}</span>
        <span className="text-xs text-navi-muted">승률 {total ? Math.round((seasonStats.wins / total) * 100) : 0}%</span>
      </Link>
      <Link to="/matches?result=무" className={`${CARD_BASE} flex flex-col gap-1 no-underline text-inherit hover:border-navi-draw/50 transition-colors cursor-pointer`}>
        <span className="text-navi-muted text-sm">무</span>
        <span className="text-2xl font-bold text-navi-draw">{seasonStats.draws}</span>
        <span className="text-xs text-navi-muted">무승부</span>
      </Link>
      <Link to="/matches?result=패" className={`${CARD_BASE} flex flex-col gap-1 no-underline text-inherit hover:border-navi-lose/50 transition-colors cursor-pointer`}>
        <span className="text-navi-muted text-sm">패</span>
        <span className="text-2xl font-bold text-navi-lose">{seasonStats.losses}</span>
        <span className="text-xs text-navi-muted">패배</span>
      </Link>
    </section>
  )
}
