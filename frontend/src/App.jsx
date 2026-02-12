import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { fetchHome, fetchMatches, fetchGoalLogs, fetchAssistLogs, fetchAttendanceLogs } from './api'
import Header from './components/Header'
import Home from './pages/Home'
import PlayerDetail from './pages/PlayerDetail'
import AllMatches from './pages/AllMatches'
import Goals from './pages/Goals'
import Assists from './pages/Assists'
import Attendance from './pages/Attendance'
import Admin from './pages/Admin'
import AdminMatchEdit from './pages/AdminMatchEdit'

function App() {
  const [homeData, setHomeData] = useState(null)
  const [matches, setMatches] = useState([])
  const [goalLogs, setGoalLogs] = useState([])
  const [assistLogs, setAssistLogs] = useState([])
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')
  // /admin 하위 경로 직접 접근 시 /admin으로 리다이렉트 (경기 수정 등은 Admin 내부에서 처리)
  const isAdminSubPage = isAdminPage && location.pathname !== '/admin'

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [home, matchesRes, goalsRes, assistsRes, attendanceRes] = await Promise.all([
          fetchHome(),
          fetchMatches(),
          fetchGoalLogs(),
          fetchAssistLogs(),
          fetchAttendanceLogs(),
        ])
        if (!cancelled) {
          setHomeData(home)
          setMatches(matchesRes)
          setGoalLogs(goalsRes)
          setAssistLogs(assistsRes)
          setAttendanceLogs(attendanceRes)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // 홈 화면 진입 시마다 홈 데이터 재요청 (선수 명단 툴팁 등 최신 반영)
  useEffect(() => {
    if (location.pathname !== '/home') return
    let cancelled = false
    fetchHome()
      .then((home) => { if (!cancelled) setHomeData(home) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [location.pathname])

  // 관리 페이지: /admin 만 허용, 하위 경로는 /admin으로 리다이렉트
  if (isAdminSubPage) {
    return <Navigate to="/admin" replace />
  }
  if (isAdminPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 max-w-[1179px] w-full mx-auto">
          <Admin />
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 max-w-[1179px] w-full mx-auto">
          <p className="text-center py-8 text-navi-muted">로딩 중...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 max-w-[1179px] w-full mx-auto">
          <p className="text-center py-8 text-red-500">
            {error}
            <br />
            <small>
              {import.meta.env.VITE_API_BASE
                ? '백엔드(Railway)가 실행 중인지, 브라우저에서 API 주소(/api/home)가 열리는지 확인해 주세요.'
                : '로컬: 백엔드가 localhost:8080에서 실행 중인지 확인해 주세요.'}
            </small>
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-6 max-w-[1179px] w-full mx-auto sm:px-6">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home data={homeData} matches={matches} attendanceLogs={attendanceLogs} />} />
          <Route path="/matches" element={<AllMatches matches={matches} />} />
          <Route path="/goals" element={<Goals logs={goalLogs} />} />
          <Route path="/assists" element={<Assists logs={assistLogs} />} />
          <Route path="/attendance" element={<Attendance logs={attendanceLogs} />} />
          <Route path="/player/:name" element={<PlayerDetail />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
