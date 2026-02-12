import { Link } from 'react-router-dom'
import { CARD_BASE, CARD_TITLE } from './cardStyles'

/** 홈 3열: 선수 명단 (접이식, 툴팁에 출석/골/도움) */
export default function HomePlayerList({ playerNames, getPlayerStats, isOpen, onToggle }) {
  return (
    <section className={CARD_BASE}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-0 m-0 border-0 bg-transparent font-inherit text-inherit cursor-pointer text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h2 className={CARD_TITLE + ' mb-0'}>선수 명단</h2>
        <span className="text-navi-muted text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
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
  )
}
