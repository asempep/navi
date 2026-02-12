import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPlayers, fetchMatchDetail, updateMatch } from '../api'

/**
 * 경기 수정 UI (Admin 내부에서 사용 또는 별도 라우트)
 * matchId로 경기 상세를 불러와 수정 후 저장. onBack이 있으면 라우트 이동 없이 부모에서 닫기 처리.
 */
function AdminMatchEdit({ matchId, onBack }) {
  const navigate = useNavigate()
  const goBack = () => { if (onBack) onBack(); else navigate('/admin') }
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [players, setPlayers] = useState([])
  // 폼 상태 (경기·통계 입력과 동일)
  const [matchDate, setMatchDate] = useState('')
  const [matchTime, setMatchTime] = useState('')
  const [opponent, setOpponent] = useState('')
  const [ourScore, setOurScore] = useState('')
  const [opponentScore, setOpponentScore] = useState('')
  const [attendeeIds, setAttendeeIds] = useState([])
  const [goalAssistRows, setGoalAssistRows] = useState([{ playerId: '', goals: 0, assists: 0 }])
  const [submitStatus, setSubmitStatus] = useState(null) // 'saving' | 'ok' | { error }

  // DB에서 선수 목록 + 해당 경기 상세 불러와 폼에 채우기
  useEffect(() => {
    if (!matchId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const [playerList, detail] = await Promise.all([
          fetchPlayers(),
          fetchMatchDetail(Number(matchId)),
        ])
        if (cancelled) return
        if (!detail) {
          setLoadError('해당 경기를 찾을 수 없습니다.')
          setLoading(false)
          return
        }
        setPlayers(playerList)
        setMatchDate(detail.matchDate || '')
        setMatchTime(detail.matchTime ? String(detail.matchTime).substring(0, 5) : '')
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
      } catch (e) {
        if (!cancelled) setLoadError(e.message || '경기 정보를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [matchId])

  const toggleAttendee = (playerId) => {
    setAttendeeIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    )
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('saving')
    try {
      const dateStr = matchDate.trim()
      if (!dateStr) {
        setSubmitStatus({ error: '경기일을 입력해 주세요.' })
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
        attendeePlayerIds: attendeeIds.map((id) => Number(id)).filter((n) => Number.isInteger(n) && n > 0),
        goalAssistRecords,
      }
      await updateMatch(Number(matchId), body)
      setSubmitStatus('ok')
      setTimeout(goBack, 1500)
    } catch (err) {
      setSubmitStatus({ error: err.message || '경기 수정에 실패했습니다.' })
    }
  }

  const card = 'bg-navi-card border border-navi-border rounded-xl p-4 sm:p-5 mb-4'
  const inputClass = 'w-full max-w-md font-sans text-base px-3 py-2.5 border border-navi-border rounded-lg bg-navi-bg text-navi-text focus:outline-none focus:border-navi-accent min-h-[44px]'
  const btnPrimary = 'font-sans text-base px-5 py-2.5 border border-navi-button bg-navi-button text-white rounded-lg cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]'
  const btnSecondary = 'font-sans text-sm px-4 py-2 border border-navi-border rounded-md bg-transparent text-navi-text cursor-pointer hover:opacity-90'

  if (loading) {
    return (
      <div className="max-w-full">
        <section className={card}>
          <p className="py-6 text-center text-navi-muted">경기 정보를 불러오는 중…</p>
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-full">
        <section className={card}>
          <p className="text-red-500 text-sm mb-3 m-0" role="alert">{loadError}</p>
          <button type="button" className={btnSecondary + ' text-navi-muted'} onClick={goBack}>목록으로 돌아가기</button>
        </section>
      </div>
    )
  }

  return (
    <div className="max-w-full">
      <section className={card}>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-sm font-semibold text-navi-muted m-0">경기 수정</h2>
          <button type="button" className={btnSecondary + ' text-navi-muted'} onClick={goBack}>목록으로</button>
        </div>
      </section>
      <section className={card}>
        <h2 className="text-sm font-semibold text-navi-muted mb-2">경기·통계 수정 (2026 NAVI STATISTICS)</h2>
        <p className="text-navi-muted text-sm mb-4 leading-relaxed">아래 내용을 수정한 뒤 「수정 완료」를 누르세요. DB에 반영된 기존 값이 불러와져 있습니다.</p>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
            <p className="text-xs text-navi-muted mt-1 mb-2">선수별 골·도움 수를 선택 후 입력</p>
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
            <button type="button" className="text-sm py-1.5 px-2.5 border border-navi-button text-navi-button rounded bg-transparent cursor-pointer hover:bg-black/5" onClick={addGoalAssistRow}>+ 골/도움 행 추가</button>
          </div>
          {submitStatus === 'saving' && <p className="text-sm text-navi-muted m-0">저장 중…</p>}
          {submitStatus === 'ok' && <p className="text-sm text-navi-accent m-0">수정되었습니다. 목록으로 이동합니다.</p>}
          {submitStatus?.error && <p className="text-red-500 text-sm m-0" role="alert">{submitStatus.error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={btnPrimary} disabled={submitStatus === 'saving'}>수정 완료</button>
            <button type="button" className={btnSecondary} onClick={goBack}>취소</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AdminMatchEdit
