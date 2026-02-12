import { CARD_BASE, CARD_TITLE } from './cardStyles'

function formatMatchTime(time) {
  if (typeof time !== 'string') return time ?? ''
  return time.slice(0, 5)
}

/** 홈 1열: 다음 경기 카드 */
export default function HomeNextMatches({ nextMatches = [] }) {
  return (
    <section className={CARD_BASE}>
      <h2 className={CARD_TITLE}>다음 경기</h2>
      {nextMatches.length === 0 ? (
        <p className="py-3 text-center text-navi-muted text-xs">등록된 다음 경기가 없습니다.</p>
      ) : (
        <ul className="list-none p-0 m-0 space-y-1.5">
          {nextMatches.slice(0, 3).map((m) => (
            <li key={m.id} className="py-1.5 border-b border-navi-border last:border-0 text-xs">
              <span className="font-semibold text-navi-accent">{m.matchDate}</span>
              {m.matchTime != null && <span className="ml-2 text-navi-muted">{formatMatchTime(m.matchTime)}</span>}
              <span className="block font-semibold text-navi-text">vs {m.opponent}</span>
              {m.venue && <span className="text-navi-muted text-xs">{m.venue}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
