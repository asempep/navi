import { Link } from 'react-router-dom'
import { CARD_BASE, CARD_TITLE } from './cardStyles'

/** 홈: 득점 순위 테이블 (상위 5명, 접이식) */
export default function HomeGoalRanking({ topGoals, isOpen, onToggle }) {
  return (
    <section className={CARD_BASE}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-0 m-0 border-0 bg-transparent font-inherit text-inherit cursor-pointer text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h2 className={CARD_TITLE + ' mb-0'}>득점 순위</h2>
        <span className="text-navi-muted text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1.5 px-2 text-navi-muted font-semibold w-10">#</th>
                  <th className="text-left py-1.5 px-2 text-navi-muted font-semibold">선수</th>
                  <th className="text-right py-1.5 px-2 text-navi-muted font-semibold w-14">골</th>
                </tr>
              </thead>
              <tbody>
                {topGoals.length === 0 ? (
                  <tr><td colSpan={3} className="py-4 text-center text-navi-muted">기록 없음</td></tr>
                ) : (
                  topGoals.map((r) => (
                    <tr key={r.playerName} className="hover:bg-black/5">
                      <td className={`py-1.5 px-2 font-semibold ${r.rank <= 3 ? 'text-amber-500' : 'text-black'}`}>{r.rank}</td>
                      <td className="py-1.5 px-2 whitespace-nowrap">
                        <Link to={`/player/${encodeURIComponent(r.playerName)}`} className="text-xs text-navi-accent no-underline hover:underline">
                          {r.playerName}
                        </Link>
                      </td>
                      <td className="py-1.5 px-2 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 -mx-2 px-2">
            <Link to="/goals" className="text-xs text-navi-accent hover:underline">전체 득점 순위 →</Link>
          </div>
        </>
      )}
    </section>
  )
}
