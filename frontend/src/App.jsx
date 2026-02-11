import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { fetchHome, fetchMatches, fetchGoalLogs, fetchAssistLogs, fetchAttendanceLogs } from './api'
import Header from './components/Header'
import Home from './pages/Home'
import PlayerDetail from './pages/PlayerDetail'
import AllMatches from './pages/AllMatches'
import Goals from './pages/Goals'
import Assists from './pages/Assists'
import Attendance from './pages/Attendance'
import Admin from './pages/Admin'
import './App.css'

function App() {
  const [homeData, setHomeData] = useState(null)
  const [matches, setMatches] = useState([])
  const [goalLogs, setGoalLogs] = useState([])
  const [assistLogs, setAssistLogs] = useState([])
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'

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

  // 관리 페이지: 데이터 로딩/에러와 무관하게 표시
  if (isAdminPage) {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <Admin />
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <p className="loading">로딩 중...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <main className="main">
          <p className="error">
            {error}
            <br />
            <small>백엔드(Spring)가 localhost:8080 에서 실행 중인지 확인해 주세요.</small>
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home data={homeData} />} />
          <Route path="/home" element={<Home data={homeData} />} />
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
