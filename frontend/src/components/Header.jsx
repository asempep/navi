/**
 * 앱 상단 헤더
 * - 메인 앱(홈/경기/골/도움/출석/선수): 로고만 표시 (네비는 각 페이지 좌측 MainNavSidebar)
 * - 관리: 로고 + 메인으로 버튼
 */
import { Link, useLocation } from 'react-router-dom'
import { BTN_BASE, BTN_INACTIVE } from './navConfig'

export default function Header() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  return (
    <header className="sticky top-0 z-10 border-b border-navi-border bg-navi-card px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap justify-between items-center gap-3">
      <Link
        to="/home"
        className="block font-cinzel font-bold text-navi-accent text-2xl sm:text-4xl md:text-5xl leading-tight rounded no-underline hover:opacity-90 transition-opacity"
        aria-label="홈으로 이동"
      >
        FC Natus Vincere
      </Link>
      {isAdmin && (
        <Link to="/home" className={`${BTN_BASE} ${BTN_INACTIVE} text-navi-muted`}>메인으로</Link>
      )}
    </header>
  )
}
