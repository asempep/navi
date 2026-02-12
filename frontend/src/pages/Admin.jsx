import { useState, useEffect } from 'react'
import {
  fetchPlayers,
  fetchMatches,
  createMatch,
  deleteMatch,
  fetchNextMatches,
  createNextMatch,
  updateNextMatch,
  deleteNextMatch,
} from '../api'
import AdminMatchEdit from './AdminMatchEdit'

// 환경 변수로 설정 가능 (Vite: VITE_ADMIN_PASSWORD), 없으면 기본값 사용
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '1234'

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
  const [editingMatchId, setEditingMatchId] = useState(null) // 경기 수정 시 해당 ID, null이면 목록/등록 화면
  // 다음 경기 (홈 화면 "다음 경기" 섹션용)
  const [nextMatches, setNextMatches] = useState([])
  const [nextMatchDate, setNextMatchDate] = useState('')
  const [nextMatchTime, setNextMatchTime] = useState('')
  const [nextMatchOpponent, setNextMatchOpponent] = useState('')
  const [nextMatchVenue, setNextMatchVenue] = useState('')
  const [nextMatchMemo, setNextMatchMemo] = useState('')
  const [editingNextMatchId, setEditingNextMatchId] = useState(null) // 수정 중인 다음 경기 ID
  const [nextMatchSubmitStatus, setNextMatchSubmitStatus] = useState(null) // 'saving' | 'ok' | { error }

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

  // 인증 후 선수 목록 + 경기 목록 + 다음 경기 목록 로드
  useEffect(() => {
    if (!isVerified) return
    let cancelled = false
    async function load() {
      setLoadError(null)
      try {
        const [playerList, matchList, nextMatchList] = await Promise.all([
          fetchPlayers(),
          fetchMatches(),
          fetchNextMatches(),
        ])
        if (!cancelled) {
          setPlayers(playerList)
          setMatches(matchList)
          setNextMatches(nextMatchList)
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
    setMatchSubmitStatus(null)
  }

  // 다음 경기 폼 초기화
  const resetNextMatchForm = () => {
    setNextMatchDate('')
    setNextMatchTime('')
    setNextMatchOpponent('')
    setNextMatchVenue('')
    setNextMatchMemo('')
    setEditingNextMatchId(null)
    setNextMatchSubmitStatus(null)
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
      await createMatch(body)
      const list = await fetchMatches()
      setMatches(list)
      resetMatchForm()
      setMatchSubmitStatus('ok')
      setTimeout(() => setMatchSubmitStatus(null), 2500)
    } catch (err) {
      setMatchSubmitStatus({ error: err.message || '경기 등록에 실패했습니다.' })
    }
  }

  // 삭제 클릭
  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('이 경기를 삭제할까요? 참석·골/도움 기록도 함께 삭제됩니다.')) return
    try {
      await deleteMatch(matchId)
      const list = await fetchMatches()
      setMatches(list)
    } catch (e) {
      setMatchSubmitStatus({ error: e.message || '경기 삭제에 실패했습니다.' })
    }
  }

  // 다음 경기 등록 또는 수정 제출
  const handleSubmitNextMatch = async (e) => {
    e.preventDefault()
    setNextMatchSubmitStatus('saving')
    try {
      const dateStr = nextMatchDate.trim()
      const opponentStr = nextMatchOpponent.trim()
      if (!dateStr || !opponentStr) {
        setNextMatchSubmitStatus({ error: '경기일과 상대팀을 입력해 주세요.' })
        return
      }
      const body = {
        matchDate: dateStr,
        matchTime: nextMatchTime.trim() || null,
        opponent: opponentStr,
        venue: nextMatchVenue.trim() || null,
        memo: nextMatchMemo.trim() || null,
      }
      if (editingNextMatchId) {
        await updateNextMatch(editingNextMatchId, body)
      } else {
        await createNextMatch(body)
      }
      const list = await fetchNextMatches()
      setNextMatches(list)
      resetNextMatchForm()
      setNextMatchSubmitStatus('ok')
      setTimeout(() => setNextMatchSubmitStatus(null), 2500)
    } catch (err) {
      setNextMatchSubmitStatus({ error: err.message || '저장에 실패했습니다.' })
    }
  }

  // 다음 경기 수정 클릭 시 폼에 값 채우기
  const startEditNextMatch = (m) => {
    setNextMatchDate(m.matchDate || '')
    setNextMatchTime(typeof m.matchTime === 'string' ? m.matchTime.slice(0, 5) : (m.matchTime || ''))
    setNextMatchOpponent(m.opponent || '')
    setNextMatchVenue(m.venue || '')
    setNextMatchMemo(m.memo || '')
    setEditingNextMatchId(m.id)
  }

  // 다음 경기 삭제
  const handleDeleteNextMatch = async (id) => {
    if (!window.confirm('이 다음 경기를 삭제할까요?')) return
    try {
      await deleteNextMatch(id)
      const list = await fetchNextMatches()
      setNextMatches(list)
      if (editingNextMatchId === id) resetNextMatchForm()
    } catch (e) {
      setNextMatchSubmitStatus({ error: e.message || '다음 경기 삭제에 실패했습니다.' })
    }
  }

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

  const card = 'bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5 mb-4'
  const inputClass = 'w-full max-w-md font-sans text-base px-3 py-2.5 border border-navi-border rounded-lg bg-navi-bg text-navi-text focus:outline-none focus:border-navi-accent min-h-[44px]'
  const btnPrimary = 'font-sans text-base px-5 py-2.5 border border-navi-button bg-navi-button text-white rounded-lg cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]'
  const btnSecondary = 'font-sans text-sm px-4 py-2 border border-navi-border rounded-md bg-transparent text-navi-text cursor-pointer hover:opacity-90'
  const btnDanger = 'font-sans text-sm px-3 py-1.5 border border-navi-lose text-navi-lose rounded bg-transparent cursor-pointer hover:opacity-90'

  if (!isVerified) {
    return (
      <div className="max-w-full">
        <section className={card}>
          <h2 className="text-sm font-semibold text-navi-muted mb-2">관리자 로그인</h2>
          <p className="text-navi-muted text-sm mb-5">비밀번호를 입력하면 데이터 관리 페이지에 접근할 수 있습니다.</p>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <label htmlFor="admin-password" className="text-sm font-semibold text-navi-text">비밀번호</label>
            <input
              id="admin-password"
              type="password"
              className={inputClass}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              autoFocus
            />
            {errorMessage && <p className="text-red-500 text-sm m-0" role="alert">{errorMessage}</p>}
            <button type="submit" className={btnPrimary}>확인</button>
          </form>
        </section>
      </div>
    )
  }

  // 비밀번호 인증됨: 경기 수정 중이면 수정 화면만 표시 (URL은 /admin 유지)
  if (editingMatchId) {
    return (
      <div className="max-w-full">
        <AdminMatchEdit
          matchId={String(editingMatchId)}
          onBack={() => {
            setEditingMatchId(null)
            fetchMatches().then(setMatches).catch(() => {})
          }}
        />
      </div>
    )
  }

  // 데이터 관리 화면 (경기 목록 + 등록 폼)
  return (
    <div className="max-w-full">
      <section className={card}>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-sm font-semibold text-navi-muted m-0">데이터 관리</h2>
          <button type="button" className={btnSecondary + ' text-navi-muted'} onClick={handleLock}>잠그기</button>
        </div>
      </section>
      {loadError && (
        <section className={card}>
          <p className="text-red-500 text-sm mb-3 m-0" role="alert">{loadError}</p>
        </section>
      )}
      <section className={card}>
        <h2 className="text-sm font-semibold text-navi-muted mb-3">등록된 경기</h2>
        {matches.length === 0 ? (
          <p className="py-6 text-center text-navi-muted">등록된 경기가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">경기일·시간</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">상대</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">스코어</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">결과</th>
                  <th className="text-left py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5">
                    <td className="py-2 px-3 text-navi-muted text-xs">{formatMatchDate(m.matchDate, m.matchTime)}</td>
                    <td className="py-2 px-3">{m.opponent || '-'}</td>
                    <td className="py-2 px-3">{m.ourScore} : {m.opponentScore}</td>
                    <td className={`py-2 px-3 ${m.result === '승' ? 'text-navi-win' : m.result === '무' ? 'text-navi-draw' : 'text-navi-lose'}`}>{m.result}</td>
                    <td className="py-2 px-3">
                      <button type="button" className={btnSecondary + ' text-navi-button border-navi-button mr-1'} onClick={() => setEditingMatchId(m.id)}>수정</button>
                      <button type="button" className={btnDanger} onClick={() => handleDeleteMatch(m.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={card}>
        <h2 className="text-sm font-semibold text-navi-muted mb-3">다음 경기</h2>
        <p className="text-navi-muted text-sm mb-4 leading-relaxed">홈 화면 "다음 경기" 섹션에 표시됩니다. 경기일·상대팀·장소 등을 등록하세요.</p>
        {nextMatches.length === 0 ? (
          <p className="py-6 text-center text-navi-muted">등록된 다음 경기가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2 mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">경기일</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">시간</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">상대</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">장소</th>
                  <th className="text-left py-2 px-3 text-navi-muted font-semibold">비고</th>
                  <th className="text-left py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {nextMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5">
                    <td className="py-2 px-3 text-navi-muted text-xs">{formatMatchDate(m.matchDate, m.matchTime)}</td>
                    <td className="py-2 px-3">{m.matchTime != null ? String(m.matchTime).slice(0, 5) : '-'}</td>
                    <td className="py-2 px-3">{m.opponent || '-'}</td>
                    <td className="py-2 px-3">{m.venue || '-'}</td>
                    <td className="py-2 px-3">{m.memo || '-'}</td>
                    <td className="py-2 px-3">
                      <button type="button" className={btnSecondary + ' text-navi-button border-navi-button mr-1'} onClick={() => startEditNextMatch(m)}>수정</button>
                      <button type="button" className={btnDanger} onClick={() => handleDeleteNextMatch(m.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form className="flex flex-col gap-5" onSubmit={handleSubmitNextMatch}>
          <div>
            <label htmlFor="next-match-date" className="block font-semibold mb-1">경기일 *</label>
            <input id="next-match-date" type="date" className={inputClass} value={nextMatchDate} onChange={(e) => setNextMatchDate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="next-match-time" className="block font-semibold mb-1">경기 시간</label>
            <input id="next-match-time" type="time" className={inputClass} value={nextMatchTime} onChange={(e) => setNextMatchTime(e.target.value)} />
          </div>
          <div>
            <label htmlFor="next-match-opponent" className="block font-semibold mb-1">상대팀 *</label>
            <input id="next-match-opponent" type="text" className={inputClass} value={nextMatchOpponent} onChange={(e) => setNextMatchOpponent(e.target.value)} placeholder="상대팀 이름" />
          </div>
          <div>
            <label htmlFor="next-match-venue" className="block font-semibold mb-1">장소</label>
            <input id="next-match-venue" type="text" className={inputClass} value={nextMatchVenue} onChange={(e) => setNextMatchVenue(e.target.value)} placeholder="경기장/장소" />
          </div>
          <div>
            <label htmlFor="next-match-memo" className="block font-semibold mb-1">비고</label>
            <input id="next-match-memo" type="text" className={inputClass} value={nextMatchMemo} onChange={(e) => setNextMatchMemo(e.target.value)} placeholder="메모 (선택)" />
          </div>
          {nextMatchSubmitStatus === 'saving' && <p className="text-sm text-navi-muted m-0">저장 중…</p>}
          {nextMatchSubmitStatus === 'ok' && <p className="text-sm text-navi-accent m-0">저장되었습니다.</p>}
          {nextMatchSubmitStatus?.error && <p className="text-red-500 text-sm m-0" role="alert">{nextMatchSubmitStatus.error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            {editingNextMatchId ? (
              <>
                <button type="submit" className={btnPrimary} disabled={nextMatchSubmitStatus === 'saving'}>수정 완료</button>
                <button type="button" className={btnSecondary} onClick={resetNextMatchForm}>취소</button>
              </>
            ) : (
              <button type="submit" className={btnPrimary} disabled={nextMatchSubmitStatus === 'saving'}>다음 경기 등록</button>
            )}
          </div>
        </form>
      </section>

      <section className={card}>
        <h2 className="text-sm font-semibold text-navi-muted mb-2">경기·통계 입력 (2026 NAVI STATISTICS)</h2>
        <p className="text-navi-muted text-sm mb-4 leading-relaxed">경기일, 상대팀, 경기 결과, 참석자, 골/도움 기록을 입력한 뒤 제출하면 DB에 반영됩니다.</p>
        <form className="flex flex-col gap-5" onSubmit={handleSubmitMatch}>
          <div>
            <label htmlFor="match-date" className="block font-semibold mb-1">경기일 *</label>
            <input id="match-date" type="date" className={inputClass} value={matchDate} onChange={(e) => setMatchDate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="match-time" className="block font-semibold mb-1">경기 시간</label>
            <input id="match-time" type="time" className={inputClass} value={matchTime} onChange={(e) => setMatchTime(e.target.value)} />
          </div>
          <div>
            <label htmlFor="opponent" className="block font-semibold mb-1">상대팀 *</label>
            <input id="opponent" type="text" className={inputClass} value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="상대팀 이름" />
          </div>
          <div>
            <label className="block font-semibold mb-1">경기 결과 *</label>
            <p className="text-xs text-navi-muted mt-1 mb-2">예시) 6:4 → 우리팀 득점 : 상대팀 득점</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="number" min="0" className={inputClass + ' max-w-[100px]'} value={ourScore} onChange={(e) => setOurScore(e.target.value)} placeholder="우리" />
              <span className="font-semibold text-navi-muted">:</span>
              <input type="number" min="0" className={inputClass + ' max-w-[100px]'} value={opponentScore} onChange={(e) => setOpponentScore(e.target.value)} placeholder="상대" />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">참석자 *</label>
            <p className="text-xs text-navi-muted mt-1 mb-2">경기에 참석한 선수를 선택하세요.</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
              {players.map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer font-normal">
                  <input type="checkbox" checked={attendeeIds.includes(p.id)} onChange={() => toggleAttendee(p.id)} className="w-4 h-4" />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">골 / 도움 기록</label>
            <p className="text-xs text-navi-muted mt-1 mb-2">선수별 골·도움 수를 아래에서 선택 후 입력</p>
            <div className="overflow-x-auto mb-2">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold border-b border-navi-border">선수</th>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold border-b border-navi-border">골</th>
                    <th className="text-left py-2 px-2 text-navi-muted font-semibold border-b border-navi-border">도움</th>
                    <th className="text-left py-2 px-2 border-b border-navi-border"></th>
                  </tr>
                </thead>
                <tbody>
                  {goalAssistRows.map((row, index) => (
                    <tr key={index} className="border-b border-navi-border">
                      <td className="py-2 px-2">
                        <select className={inputClass + ' min-w-[100px] max-w-none'} value={row.playerId} onChange={(e) => updateGoalAssistRow(index, 'playerId', e.target.value)}>
                          <option value="">선택</option>
                          {players.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min="0" className={inputClass + ' max-w-[90px]'} value={row.goals} onChange={(e) => updateGoalAssistRow(index, 'goals', e.target.value)} />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" min="0" className={inputClass + ' max-w-[90px]'} value={row.assists} onChange={(e) => updateGoalAssistRow(index, 'assists', e.target.value)} />
                      </td>
                      <td className="py-2 px-2">
                        <button type="button" className={btnSecondary + ' text-sm py-1.5 px-2.5'} onClick={() => removeGoalAssistRow(index)} disabled={goalAssistRows.length <= 1} title="행 삭제">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="text-sm py-1.5 px-2.5 border border-navi-button text-navi-button rounded bg-transparent cursor-pointer hover:bg-white/5" onClick={addGoalAssistRow}>+ 골/도움 행 추가</button>
          </div>
          {matchSubmitStatus === 'saving' && <p className="text-sm text-navi-muted m-0">저장 중…</p>}
          {matchSubmitStatus === 'ok' && <p className="text-sm text-navi-accent m-0">경기가 등록되었습니다.</p>}
          {matchSubmitStatus?.error && <p className="text-red-500 text-sm m-0" role="alert">{matchSubmitStatus.error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={btnPrimary} disabled={matchSubmitStatus === 'saving'}>경기 등록</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Admin
