import { Link } from 'react-router-dom'
import { CARD_BASE, CARD_TITLE } from './cardStyles'

/** 홈 3열: 출석 순위 (접이식) */
export default function HomeAttendanceRanking({ attendanceRanking, isOpen, onToggle }) {
  return (
    <section className={CARD_BASE}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-0 m-0 border-0 bg-transparent font-inherit text-inherit cursor-pointer text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h2 className={CARD_TITLE + ' mb-0'}>출석 순위</h2>
        <span className="text-navi-muted text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left py-1.5 px-2 text-navi-muted font-semibold">#</th>
                <th className="text-left py-1.5 px-2 text-navi-muted font-semibold">선수</th>
                <th className="text-left py-1.5 px-2 text-navi-muted font-semibold">출석</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRanking.length === 0 ? (
                <tr><td colSpan={3} className="py-3 text-center text-navi-muted">기록 없음</td></tr>
              ) : (
                attendanceRanking.slice(0, 5).map((r) => (
                  <tr key={r.playerName} className="hover:bg-black/5">
                    <td className="py-1.5 px-2 font-semibold text-navi-muted">{r.rank}</td>
                    <td className="py-1.5 px-2">
                      <Link to={`/player/${encodeURIComponent(r.playerName)}`} className={`no-underline hover:underline ${r.rank <= 3 ? 'text-amber-500' : 'text-black'}`}>{r.playerName}</Link>
                    </td>
                    <td className="py-1.5 px-2 font-semibold">{r.value}회</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
