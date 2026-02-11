/**
 * 앱 상단 헤더
 * - URL 기반: 로고 → /, 탭 → /home, /matches, /goals, /assists, /attendance, 관리 → /admin
 */
import { Link, NavLink, useLocation } from 'react-router-dom'
import './Header.css'

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
  // 선수 상세(/player/xxx)일 때도 탭에는 홈 활성처럼 보이게
  const currentPath = location.pathname.startsWith('/player') ? '/home' : location.pathname

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-logo-btn" aria-label="홈으로 이동">
          NATUS VINCERE
        </Link>
        {!isAdmin && (
          <nav className="tabs" aria-label="메인 메뉴">
            {TABS.map((t) => (
              <NavLink
                key={t.id}
                to={t.path}
                end={t.path === '/home'}
                className={({ isActive }) => `tab ${isActive || currentPath === t.path ? 'active' : ''}`}
                isActive={t.path === '/home' ? (_, loc) => loc.pathname === '/' || loc.pathname === '/home' : undefined}
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
      {isAdmin ? (
        <Link to="/home" className="header-admin-btn header-admin-btn-back">
          메인으로
        </Link>
      ) : (
        <Link to="/admin" className="header-admin-btn">
          관리
        </Link>
      )}
    </header>
  )
}
