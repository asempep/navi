import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * 홈: 시즌 전적, 득점순위, 도움순위, 출석순위 + 오른쪽 열에 선수 이름 리스트
 * 선수 이름 클릭 시 /player/:name 으로 이동
 */
function Home({ data }) {
  if (!data) return <p className="empty">데이터가 없습니다.</p>

  const { seasonStats, nextMatches = [], goalRanking, assistRanking, attendanceRanking } = data

  // 순위 섹션 접기/펼치기 (기본 모두 펼침)
  const [openSections, setOpenSections] = useState({
    goals: true,
    assists: true,
    attendance: true,
  })
  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // 득점/도움/출석 순위에서 등장한 선수 이름을 모아 중복 제거 후 정렬
  const playerNames = [...new Set([
    ...goalRanking.map((r) => r.playerName),
    ...assistRanking.map((r) => r.playerName),
    ...attendanceRanking.map((r) => r.playerName),
  ])].sort((a, b) => a.localeCompare(b, 'ko'))

  // 경기 시간 표시 (API는 "HH:mm:ss" 또는 "HH:mm" 문자열로 옴)
  const formatMatchTime = (time) => {
    if (typeof time !== 'string') return time ?? ''
    return time.slice(0, 5)
  }

  // 선수별 출석·골·도움 수 조회 (호버 툴팁용)
  const getPlayerStats = (name) => ({
    attendance: attendanceRanking.find((r) => r.playerName === name)?.value ?? 0,
    goals: goalRanking.find((r) => r.playerName === name)?.value ?? 0,
    assists: assistRanking.find((r) => r.playerName === name)?.value ?? 0,
  })

  return (
    <div className="home">
      <div className="home-layout">
        <div className="home-main">
      <section className="card">
        <h2>시즌 전적 ({seasonStats.seasonYear})</h2>
        <div className="season-summary">
          <span className="stat">
            <strong>{seasonStats.totalMatches}</strong> 경기
          </span>
          <span className="stat result-win">
            <strong>{seasonStats.wins}</strong> 승
          </span>
          <span className="stat result-draw">
            <strong>{seasonStats.draws}</strong> 무
          </span>
          <span className="stat result-lose">
            <strong>{seasonStats.losses}</strong> 패
          </span>
        </div>
      </section>

      <section className="card">
        <h2>다음 경기</h2>
        {nextMatches.length === 0 ? (
          <p className="empty">등록된 다음 경기가 없습니다.</p>
        ) : (
          <ul className="next-match-list">
            {nextMatches.map((m) => (
              <li key={m.id} className="next-match-item">
                <span className="next-match-date">
                  {m.matchDate}
                </span>
                {m.matchTime != null && (
                  <span className="next-match-time">
                    {formatMatchTime(m.matchTime)}
                  </span>
                )}
                <span className="next-match-opponent">vs {m.opponent}</span>
                {m.venue && <span className="next-match-venue">{m.venue}</span>}
                {m.memo && <span className="next-match-memo">{m.memo}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card card-toggle">
        <button
          type="button"
          className="card-toggle-header"
          onClick={() => toggleSection('goals')}
          aria-expanded={openSections.goals}
        >
          <h2>득점 순위</h2>
          <span className="card-toggle-icon" aria-hidden>{openSections.goals ? '▼' : '▶'}</span>
        </button>
        {openSections.goals && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>선수</th>
                  <th>골</th>
                </tr>
              </thead>
              <tbody>
                {goalRanking.length === 0 ? (
                  <tr><td colSpan={3} className="empty">기록 없음</td></tr>
                ) : (
                  goalRanking.map((r) => (
                    <tr key={r.rank}>
                      <td className="rank">{r.rank}</td>
                      <td>
                        <Link to={`/player/${encodeURIComponent(r.playerName)}`} className="player-name-link">
                          {r.playerName}
                        </Link>
                      </td>
                      <td><strong>{r.value}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card card-toggle">
        <button
          type="button"
          className="card-toggle-header"
          onClick={() => toggleSection('assists')}
          aria-expanded={openSections.assists}
        >
          <h2>도움 순위</h2>
          <span className="card-toggle-icon" aria-hidden>{openSections.assists ? '▼' : '▶'}</span>
        </button>
        {openSections.assists && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>선수</th>
                  <th>도움</th>
                </tr>
              </thead>
              <tbody>
                {assistRanking.length === 0 ? (
                  <tr><td colSpan={3} className="empty">기록 없음</td></tr>
                ) : (
                  assistRanking.map((r) => (
                    <tr key={r.rank}>
                      <td className="rank">{r.rank}</td>
                      <td>
                        <Link to={`/player/${encodeURIComponent(r.playerName)}`} className="player-name-link">
                          {r.playerName}
                        </Link>
                      </td>
                      <td><strong>{r.value}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card card-toggle">
        <button
          type="button"
          className="card-toggle-header"
          onClick={() => toggleSection('attendance')}
          aria-expanded={openSections.attendance}
        >
          <h2>출석 순위</h2>
          <span className="card-toggle-icon" aria-hidden>{openSections.attendance ? '▼' : '▶'}</span>
        </button>
        {openSections.attendance && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>선수</th>
                  <th>출석</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRanking.length === 0 ? (
                  <tr><td colSpan={3} className="empty">기록 없음</td></tr>
                ) : (
                  attendanceRanking.map((r) => (
                    <tr key={r.rank}>
                      <td className="rank">{r.rank}</td>
                      <td>
                        <Link to={`/player/${encodeURIComponent(r.playerName)}`} className="player-name-link">
                          {r.playerName}
                        </Link>
                      </td>
                      <td><strong>{r.value}</strong>회</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
        </div>
        <aside className="home-sidebar">
          <section className="card">
            <h2>선수 명단</h2>
            <ul className="player-list">
              {playerNames.length === 0 ? (
                <li className="empty">등록된 선수 없음</li>
              ) : (
                playerNames.map((name) => {
                  const stats = getPlayerStats(name)
                  return (
                    <li key={name} className="player-list-item">
                      <Link to={`/player/${encodeURIComponent(name)}`} className="player-name-link player-list-name">
                        {name}
                      </Link>
                      <div className="player-tooltip" role="tooltip">
                        <span>출석 <strong>{stats.attendance}</strong>회</span>
                        <span>골 <strong>{stats.goals}</strong></span>
                        <span>도움 <strong>{stats.assists}</strong></span>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Home
