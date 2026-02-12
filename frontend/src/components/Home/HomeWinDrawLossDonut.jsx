import { CARD_BASE, CARD_TITLE } from './cardStyles'

/** 홈 2열: 승/무/패 비율 도넛 차트 */
export default function HomeWinDrawLossDonut({ seasonStats, winPct, drawPct, lossPct }) {
  return (
    <section className={CARD_BASE}>
      <h2 className={CARD_TITLE}>승/무/패 비율</h2>
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
  )
}
