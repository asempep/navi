import { CARD_BASE, CARD_TITLE } from './cardStyles'

/** 홈 1열: 득점 vs 실점 막대 비교 */
export default function HomeGoalsVsConceded({ totalGoals, totalGoalsConceded, maxGoalConceded }) {
  return (
    <section className={CARD_BASE}>
      <h2 className={CARD_TITLE}>득점 vs 실점</h2>
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
  )
}
