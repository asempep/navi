/**
 * 메인 네비게이션 버튼 설정 (단일 소스)
 * - Home 사이드바 / Header 탭에서 공통 사용
 */
import { Link, NavLink } from 'react-router-dom'

// 내부 탭 (홈, 전체 경기, 골/도움, 출석)
export const NAV_TABS = [
  { path: '/home', label: '홈', end: true },
  { path: '/matches', label: '전체 경기', end: false },
  { path: '/goals', label: '골/도움', end: false },
  { path: '/attendance', label: '출석', end: false },
]

// 외부 링크
export const EXTERNAL_LINKS = [
  { href: 'https://res.isdc.co.kr/index.do', label: '구장예약' },
  { href: 'https://www.youtube.com/@NatusVincere-mn3qc', label: '유튜브' },
  { href: 'https://www.instagram.com/fc_natusvincere?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', label: '인스타' },
]

// 관리 페이지 링크
export const ADMIN_LINK = { to: '/admin', label: '관리' }

// 버튼 공통 스타일
export const BTN_BASE = 'inline-flex items-center justify-center min-h-[36px] px-2 py-1.5 rounded-md border text-sm font-medium no-underline transition-colors shrink-0'
export const BTN_ACTIVE = 'bg-navi-button border-navi-button text-white'
export const BTN_INACTIVE = 'bg-navi-bg border-navi-border text-navi-text hover:bg-navi-border hover:border-navi-button'

// 모바일 사이드바용 작은 버튼 클래스 (한 소스에서 관리해 깨짐 방지)
const SIDEBAR_BTN = 'min-h-[32px] px-1.5 py-1 text-xs md:min-h-[36px] md:px-2 md:py-1.5 md:text-sm w-full justify-center whitespace-nowrap'

/**
 * Home 전용: 좌측/상단 네비 (모바일 3x3 그리드, 데스크톱 세로)
 */
export function MainNavSidebar() {
  const btnClass = (active) =>
    `${BTN_BASE} ${SIDEBAR_BTN} ${active ? BTN_ACTIVE : BTN_INACTIVE}`

  return (
    <nav
      className="grid grid-cols-3 gap-1.5 md:flex md:flex-col md:gap-2 shrink-0 w-full md:w-auto md:min-w-[140px] order-first md:order-none"
      aria-label="메인 메뉴 및 링크"
    >
      {NAV_TABS.map((t) => (
        <NavLink
          key={t.path}
          to={t.path}
          end={t.end}
          isActive={t.end ? (_, loc) => loc.pathname === '/home' : undefined}
          className={({ isActive }) => btnClass(isActive)}
        >
          {t.label}
        </NavLink>
      ))}
      {EXTERNAL_LINKS.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass(false)}
        >
          {label}
        </a>
      ))}
      <Link to={ADMIN_LINK.to} className={btnClass(false)}>
        {ADMIN_LINK.label}
      </Link>
    </nav>
  )
}
