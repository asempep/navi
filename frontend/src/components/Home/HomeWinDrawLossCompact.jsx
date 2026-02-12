import { Link } from 'react-router-dom'
import { CARD_BASE } from './cardStyles'

/**
 * 총 경기 / 승 / 무 / 패를 한 칸에 압축
 * - 왼쪽: 작은 도넛 차트
 * - 오른쪽: 4개 지표 한 줄
 */
export default function HomeWinDrawLossCompact({ seasonStats, winPct, drawPct, lossPct }) {
  const total = seasonStats.totalMatches || 1
  const winRate = total ? Math.round((seasonStats.wins / total) * 100) : 0

  return (
    <section className={`${CARD_BASE} flex flex-row items-center gap-4 sm:gap-5`}>
      {/* 작은 도넛: 승/무/패 비율 */}
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
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
      </div>

      {/* 총 경기 / 승 / 무 / 패 한 줄 */}
      <div className="min-w-0 flex-1 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
        <Link to="/matches" className="flex items-baseline gap-1 no-underline text-inherit hover:opacity-80">
          <span className="text-navi-muted">총 경기</span>
          <span className="font-bold text-navi-text">{seasonStats.totalMatches}</span>
        </Link>
        <span className="text-navi-border">|</span>
        <Link to="/matches?result=승" className="flex items-baseline gap-1 no-underline text-inherit hover:opacity-80">
          <span className="w-2 h-2 rounded-full bg-navi-win flex-shrink-0 mt-0.5" />
          <span className="text-navi-muted">승</span>
          <span className="font-bold text-navi-win">{seasonStats.wins}</span>
          <span className="text-navi-muted text-xs">({winRate}%)</span>
        </Link>
        <Link to="/matches?result=무" className="flex items-baseline gap-1 no-underline text-inherit hover:opacity-80">
          <span className="w-2 h-2 rounded-full bg-navi-draw flex-shrink-0 mt-0.5" />
          <span className="text-navi-muted">무</span>
          <span className="font-bold text-navi-draw">{seasonStats.draws}</span>
        </Link>
        <Link to="/matches?result=패" className="flex items-baseline gap-1 no-underline text-inherit hover:opacity-80">
          <span className="w-2 h-2 rounded-full bg-navi-lose flex-shrink-0 mt-0.5" />
          <span className="text-navi-muted">패</span>
          <span className="font-bold text-navi-lose">{seasonStats.losses}</span>
        </Link>
      </div>
    </section>
  )
}
