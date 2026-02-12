/**
 * 앱 상단 헤더
 * - URL 기반: 로고 → /, 탭 → /home, /matches, /goals, /assists, /attendance, 관리 → /admin
 */
import { Link, NavLink, useLocation } from 'react-router-dom'

const TABS = [
  { id: 'home', path: '/home', label: '홈' },
  { id: 'matches', path: '/matches', label: '전체 경기' },
  { id: 'goals', path: '/goals', label: '골' },
  { id: 'assists', path: '/assists', label: '도움' },
  { id: 'attendance', path: '/attendance', label: '출석' },
]

export default function Header() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'
  const currentPath = location.pathname.startsWith('/player') ? '/home' : location.pathname

  return (
    <header className="sticky top-0 z-10 border-b border-navi-border bg-gradient-to-b from-black to-navi-bg px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap justify-between items-start gap-3">
      <div className="flex-1 min-w-0">
        <Link
          to="/"
          className="block font-cinzel font-bold text-navi-accent text-2xl sm:text-4xl md:text-5xl leading-tight rounded no-underline hover:opacity-90 transition-opacity"
          aria-label="홈으로 이동"
        >
          NATUS VINCERE
        </Link>
        {!isAdmin && (
          <nav className="flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden -mx-1 py-1 scrollbar-hide mt-3" aria-label="메인 메뉴" style={{ WebkitOverflowScrolling: 'touch' }}>
            {TABS.map((t) => (
              <NavLink
                key={t.id}
                to={t.path}
                end={t.path === '/home'}
                className={({ isActive }) =>
                  `shrink-0 min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isActive || currentPath === t.path
                      ? 'bg-navi-button border-navi-button text-white'
                      : 'bg-navi-bg border-navi-border text-navi-text hover:bg-navi-border hover:border-navi-button'
                  }`
                }
                isActive={t.path === '/home' ? (_, loc) => loc.pathname === '/' || loc.pathname === '/home' : undefined}
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
        {!isAdmin && (
          <div className="flex flex-wrap gap-2 order-2 w-full sm:w-auto sm:order-1 justify-end" aria-label="외부 링크">
            <a
              href="https://res.isdc.co.kr/index.do"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-2 text-sm border border-navi-border rounded-lg bg-navi-bg text-navi-text no-underline hover:bg-navi-border hover:border-navi-button transition-colors"
            >
              구장예약
            </a>
            <a
              href="https://www.youtube.com/@NatusVincere-mn3qc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-2 text-sm border border-navi-border rounded-lg bg-navi-bg text-navi-text no-underline hover:bg-navi-border hover:border-navi-button transition-colors"
            >
              유튜브
            </a>
            <a
              href="https://www.instagram.com/fc_natusvincere?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-2 text-sm border border-navi-border rounded-lg bg-navi-bg text-navi-text no-underline hover:bg-navi-border hover:border-navi-button transition-colors"
            >
              인스타
            </a>
          </div>
        )}
        {isAdmin ? (
          <Link to="/home" className="inline-block px-4 py-2 text-sm border border-navi-border rounded-lg bg-navi-bg text-navi-muted no-underline hover:bg-navi-border hover:border-navi-button transition-colors">
            메인으로
          </Link>
        ) : (
          <Link to="/admin" className="inline-block px-4 py-2 text-sm border border-navi-border rounded-lg bg-navi-bg text-navi-text no-underline hover:bg-navi-border hover:border-navi-button transition-colors">
            관리
          </Link>
        )}
      </div>
    </header>
  )
}
