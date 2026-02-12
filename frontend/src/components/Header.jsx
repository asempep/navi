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

// 버튼 공통 스타일 (바디에서 사용하는 것과 동일한 크기)
const BTN_BASE = 'inline-flex items-center justify-center min-h-[36px] px-2 py-1.5 rounded-md border text-sm font-medium no-underline transition-colors shrink-0'
const BTN_ACTIVE = 'bg-navi-button border-navi-button text-white'
const BTN_INACTIVE = 'bg-navi-bg border-navi-border text-navi-text hover:bg-navi-border hover:border-navi-button'

export default function Header() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'
  const isHome = location.pathname === '/' || location.pathname === '/home'
  const currentPath = location.pathname.startsWith('/player') ? '/home' : location.pathname
  // 홈일 때는 탭/버튼을 바디로 옮겼으므로 헤더에는 로고만
  const showNavAndButtons = !isAdmin && !isHome

  return (
    <header className="sticky top-0 z-10 border-b border-navi-border bg-navi-card px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap justify-between items-start gap-3">
      <div className="flex-1 min-w-0">
        <Link
          to="/"
          className="block font-cinzel font-bold text-navi-accent text-2xl sm:text-4xl md:text-5xl leading-tight rounded no-underline hover:opacity-90 transition-opacity"
          aria-label="홈으로 이동"
        >
          NATUS VINCERE
        </Link>
        {showNavAndButtons && (
          <nav className="flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden -mx-1 py-1 scrollbar-hide mt-3" aria-label="메인 메뉴" style={{ WebkitOverflowScrolling: 'touch' }}>
            {TABS.map((t) => (
              <NavLink
                key={t.id}
                to={t.path}
                end={t.path === '/home'}
                className={({ isActive }) =>
                  `${BTN_BASE} ${isActive || currentPath === t.path ? BTN_ACTIVE : BTN_INACTIVE}`
                }
                isActive={t.path === '/home' ? (_, loc) => loc.pathname === '/' || loc.pathname === '/home' : undefined}
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
      {showNavAndButtons && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end" aria-label="외부 링크 및 관리">
          <a
            href="https://res.isdc.co.kr/index.do"
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_BASE} ${BTN_INACTIVE}`}
          >
            구장예약
          </a>
          <a
            href="https://www.youtube.com/@NatusVincere-mn3qc"
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_BASE} ${BTN_INACTIVE}`}
          >
            유튜브
          </a>
          <a
            href="https://www.instagram.com/fc_natusvincere?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_BASE} ${BTN_INACTIVE}`}
          >
            인스타
          </a>
          <Link to="/admin" className={`${BTN_BASE} ${BTN_INACTIVE}`}>
            관리
          </Link>
        </div>
      )}
      {isAdmin && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/home" className={`${BTN_BASE} ${BTN_INACTIVE} text-navi-muted`}>
            메인으로
          </Link>
        </div>
      )}
    </header>
  )
}
