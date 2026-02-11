import { useState, useEffect } from 'react'
import { fetchPlayers, fetchMatches, fetchMatchDetail, createMatch, updateMatch, deleteMatch } from '../api'

// 환경 변수로 설정 가능 (Vite: VITE_ADMIN_PASSWORD), 없으면 기본값 사용
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

/**
 * 관리 페이지: 비밀번호 확인 후 데이터 관리 (경기·통계 입력)
 */
function Admin() {
  const [isVerified, setIsVerified] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [players, setPlayers] = useState([])
  const [loadError, setLoadError] = useState(null)
  // 경기 등록 폼 상태 (Google Form 항목과 동일)
  const [matchDate, setMatchDate] = useState('')
  const [matchTime, setMatchTime] = useState('') // HH:mm (선택)
  const [opponent, setOpponent] = useState('')
  const [ourScore, setOurScore] = useState('')
  const [opponentScore, setOpponentScore] = useState('')
  const [attendeeIds, setAttendeeIds] = useState([]) // 참석한 선수 ID 목록
  const [goalAssistRows, setGoalAssistRows] = useState([{ playerId: '', goals: 0, assists: 0 }])
  const [matchSubmitStatus, setMatchSubmitStatus] = useState(null) // 'saving' | 'ok' | { error }
  const [matches, setMatches] = useState([]) // 등록된 경기 목록
  const [editingMatchId, setEditingMatchId] = useState(null) // 수정 중인 경기 ID (null이면 새 등록)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (passwordInput.trim() === '') {
      setErrorMessage('비밀번호를 입력해 주세요.')
      return
    }
    if (passwordInput === ADMIN_PASSWORD) {
      setIsVerified(true)
      setPasswordInput('')
    } else {
      setErrorMessage('비밀번호가 일치하지 않습니다.')
    }
  }

  const handleLock = () => {
    setIsVerified(false)
    setPasswordInput('')
    setErrorMessage('')
  }

  // 인증 후 선수 목록 + 경기 목록 로드
  useEffect(() => {
    if (!isVerified) return
    let cancelled = false
    async function load() {
      setLoadError(null)
      try {
        const [playerList, matchList] = await Promise.all([fetchPlayers(), fetchMatches()])
        if (!cancelled) {
          setPlayers(playerList)
          setMatches(matchList)
        }
      } catch (e) {
        if (!cancelled) setLoadError(e.message)
      }
    }
    load()
    return () => { cancelled = true }
  }, [isVerified])

  // 폼 초기화 (새 등록 모드로)
  const resetMatchForm = () => {
    setMatchDate('')
    setMatchTime('')
    setOpponent('')
    setOurScore('')
    setOpponentScore('')
    setAttendeeIds([])
    setGoalAssistRows([{ playerId: '', goals: 0, assists: 0 }])
    setEditingMatchId(null)
    setMatchSubmitStatus(null)
  }

  // 참석자 체크 토글
  const toggleAttendee = (playerId) => {
    setAttendeeIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    )
  }

  // 골/도움 행 추가
  const addGoalAssistRow = () => {
    setGoalAssistRows((prev) => [...prev, { playerId: '', goals: 0, assists: 0 }])
  }
  const updateGoalAssistRow = (index, field, value) => {
    setGoalAssistRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }
  const removeGoalAssistRow = (index) => {
    setGoalAssistRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  // 경기 등록 또는 수정 제출
  const handleSubmitMatch = async (e) => {
    e.preventDefault()
    setMatchSubmitStatus('saving')
    try {
      const dateStr = matchDate.trim()
      if (!dateStr) {
        setMatchSubmitStatus({ error: '경기일을 입력해 주세요.' })
        return
      }
      const goalAssistRecords = goalAssistRows
        .filter((r) => r.playerId && (Number(r.goals) > 0 || Number(r.assists) > 0))
        .map((r) => ({
          playerId: Number(r.playerId),
          goals: Math.max(0, Number(r.goals) || 0),
          assists: Math.max(0, Number(r.assists) || 0),
        }))
      const body = {
        matchDate: dateStr,
        matchTime: matchTime.trim() || null,
        opponent: opponent.trim(),
        ourScore: Number(ourScore) || 0,
        opponentScore: Number(opponentScore) || 0,
        attendeePlayerIds: attendeeIds,
        goalAssistRecords,
      }
      if (editingMatchId) {
        await updateMatch(editingMatchId, body)
        setMatchSubmitStatus('ok')
        resetMatchForm()
      } else {
        await createMatch(body)
        setMatchSubmitStatus('ok')
        resetMatchForm()
      }
      const list = await fetchMatches()
      setMatches(list)
      resetMatchForm()
      setMatchSubmitStatus('ok')
      setTimeout(() => setMatchSubmitStatus(null), 2500)
    } catch (err) {
      setMatchSubmitStatus({ error: err.message || (editingMatchId ? '경기 수정에 실패했습니다.' : '경기 등록에 실패했습니다.') })
    }
  }

  // 수정 클릭 시 폼에 경기 데이터 채우기
  const handleEditMatch = async (matchId) => {
    try {
      const detail = await fetchMatchDetail(matchId)
      if (!detail) return
      setMatchDate(detail.matchDate || '')
      setMatchTime(detail.matchTime ? String(detail.matchTime).substring(0, 5) : '') // HH:mm
      setOpponent(detail.opponent || '')
      setOurScore(detail.ourScore ?? '')
      setOpponentScore(detail.opponentScore ?? '')
      setAttendeeIds(detail.attendeePlayerIds || [])
      const rows = (detail.goalAssistRecords || []).map((r) => ({
        playerId: r.playerId,
        goals: r.goals ?? 0,
        assists: r.assists ?? 0,
      }))
      setGoalAssistRows(rows.length ? rows : [{ playerId: '', goals: 0, assists: 0 }])
      setEditingMatchId(matchId)
      setMatchSubmitStatus(null)
    } catch (e) {
      setMatchSubmitStatus({ error: e.message || '경기 정보를 불러오지 못했습니다.' })
    }
  }

  // 삭제 클릭
  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('이 경기를 삭제할까요? 참석·골/도움 기록도 함께 삭제됩니다.')) return
    try {
      await deleteMatch(matchId)
      const list = await fetchMatches()
      setMatches(list)
      if (editingMatchId === matchId) resetMatchForm()
    } catch (e) {
      setMatchSubmitStatus({ error: e.message || '경기 삭제에 실패했습니다.' })
    }
  }

  // 날짜 포맷 (경기 목록 표시)
  const formatMatchDate = (dateStr, timeStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const datePart = d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
    if (timeStr) {
      const t = String(timeStr).substring(0, 5)
      return `${datePart} ${t}`
    }
    return datePart
  }

  // 비밀번호 미인증: 로그인 폼 표시
  if (!isVerified) {
    return (
      <div className="admin-page">
        <section className="card admin-login-card">
          <h2>관리자 로그인</h2>
          <p className="admin-login-desc">비밀번호를 입력하면 데이터 관리 페이지에 접근할 수 있습니다.</p>
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label htmlFor="admin-password" className="admin-login-label">
              비밀번호
            </label>
            <input
              id="admin-password"
              type="password"
              className="admin-login-input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              autoFocus
            />
            {errorMessage && <p className="admin-login-error" role="alert">{errorMessage}</p>}
            <button type="submit" className="admin-login-submit">
              확인
            </button>
          </form>
        </section>
      </div>
    )
  }

  // 비밀번호 인증됨: 데이터 관리 화면
  return (
    <div className="admin-page">
      <section className="card admin-toolbar">
        <div className="admin-toolbar-inner">
          <h2>데이터 관리</h2>
          <button type="button" className="header-admin-btn header-admin-btn-back" onClick={handleLock}>
            잠그기
          </button>
        </div>
      </section>
      {loadError && (
        <section className="card">
          <p className="admin-error" role="alert">{loadError}</p>
        </section>
      )}
      <section className="card">
        <h2>등록된 경기</h2>
        {matches.length === 0 ? (
          <p className="empty">등록된 경기가 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-matches-table">
              <thead>
                <tr>
                  <th>경기일·시간</th>
                  <th>상대</th>
                  <th>스코어</th>
                  <th>결과</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id}>
                    <td className="date">{formatMatchDate(m.matchDate, m.matchTime)}</td>
                    <td>{m.opponent || '-'}</td>
                    <td>{m.ourScore} : {m.opponentScore}</td>
                    <td className={m.result === '승' ? 'result-win' : m.result === '무' ? 'result-draw' : 'result-lose'}>{m.result}</td>
                    <td>
                      <button type="button" className="admin-edit-btn" onClick={() => handleEditMatch(m.id)}>수정</button>
                      <button type="button" className="admin-delete-btn" onClick={() => handleDeleteMatch(m.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="card admin-match-form-card">
        <h2>{editingMatchId ? '경기 수정' : '경기·통계 입력 (2026 NAVI STATISTICS)'}</h2>
        <p className="admin-desc">
          {editingMatchId
            ? '아래 내용을 수정한 뒤 「수정 완료」를 누르세요.'
            : '경기일, 상대팀, 경기 결과, 참석자, 골/도움 기록을 입력한 뒤 제출하면 DB에 반영됩니다.'}
        </p>
        <form className="admin-match-form" onSubmit={handleSubmitMatch}>
          <div className="admin-form-group">
            <label htmlFor="match-date">경기일 *</label>
            <input
              id="match-date"
              type="date"
              className="admin-form-input"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="match-time">경기 시간</label>
            <input
              id="match-time"
              type="time"
              className="admin-form-input"
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="opponent">상대팀 *</label>
            <input
              id="opponent"
              type="text"
              className="admin-form-input"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="상대팀 이름"
            />
          </div>
          <div className="admin-form-group">
            <label>경기 결과 *</label>
            <p className="admin-form-hint">예시) 6:4 → 우리팀 득점 : 상대팀 득점</p>
            <div className="admin-score-row">
              <input
                type="number"
                min="0"
                className="admin-form-input admin-score-input"
                value={ourScore}
                onChange={(e) => setOurScore(e.target.value)}
                placeholder="우리"
              />
              <span className="admin-score-sep">:</span>
              <input
                type="number"
                min="0"
                className="admin-form-input admin-score-input"
                value={opponentScore}
                onChange={(e) => setOpponentScore(e.target.value)}
                placeholder="상대"
              />
            </div>
          </div>
          <div className="admin-form-group">
            <label>참석자 *</label>
            <p className="admin-form-hint">경기에 참석한 선수를 선택하세요.</p>
            <div className="admin-attendee-grid">
              {players.map((p) => (
                <label key={p.id} className="admin-attendee-check">
                  <input
                    type="checkbox"
                    checked={attendeeIds.includes(p.id)}
                    onChange={() => toggleAttendee(p.id)}
                  />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="admin-form-group">
            <label>골 / 도움 기록</label>
            <p className="admin-form-hint">입력 예시: 선수별 골·도움 수를 아래에서 선택 후 입력</p>
            <div className="admin-goal-assist-table-wrap">
              <table className="admin-goal-assist-table">
                <thead>
                  <tr>
                    <th>선수</th>
                    <th>골</th>
                    <th>도움</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {goalAssistRows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          className="admin-form-select"
                          value={row.playerId}
                          onChange={(e) => updateGoalAssistRow(index, 'playerId', e.target.value)}
                        >
                          <option value="">선택</option>
                          {players.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="admin-form-input admin-ga-input"
                          value={row.goals}
                          onChange={(e) => updateGoalAssistRow(index, 'goals', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="admin-form-input admin-ga-input"
                          value={row.assists}
                          onChange={(e) => updateGoalAssistRow(index, 'assists', e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-remove-row-btn"
                          onClick={() => removeGoalAssistRow(index)}
                          disabled={goalAssistRows.length <= 1}
                          title="행 삭제"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="admin-add-row-btn" onClick={addGoalAssistRow}>
              + 골/도움 행 추가
            </button>
          </div>
          {matchSubmitStatus === 'saving' && <p className="admin-form-status">저장 중…</p>}
          {matchSubmitStatus === 'ok' && <p className="admin-form-status admin-form-status-ok">{editingMatchId ? '수정되었습니다.' : '경기가 등록되었습니다.'}</p>}
          {matchSubmitStatus?.error && <p className="admin-error" role="alert">{matchSubmitStatus.error}</p>}
          <div className="admin-form-actions">
            <button type="submit" className="admin-form-submit" disabled={matchSubmitStatus === 'saving'}>
              {editingMatchId ? '수정 완료' : '경기 등록'}
            </button>
            {editingMatchId && (
              <button type="button" className="admin-form-cancel" onClick={resetMatchForm}>
                취소
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}

export default Admin
