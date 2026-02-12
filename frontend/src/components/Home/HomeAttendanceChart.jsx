import { useMemo } from 'react'
import { CARD_BASE, CARD_TITLE } from './cardStyles'
import { CHART_W, CHART_H, PAD_LEFT, PAD_TOP, getPlotSize, makeSmoothPath } from './chartUtils'

function formatDateLabel(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return ''
  const m = parseInt(dateStr.slice(5, 7), 10)
  const d = parseInt(dateStr.slice(8, 10), 10)
  return `${m}.${d}일`
}

/** 홈 2열: 경기당 출석 인원 수 라인 차트 */
export default function HomeAttendanceChart({ attendanceLogs = [] }) {
  const { plotW, plotH } = getPlotSize()

  const attendanceByDate = useMemo(() => {
    const sorted = [...attendanceLogs].filter((r) => r.matchDate).sort((a, b) => (a.matchDate || '').localeCompare(b.matchDate || ''))
    return sorted.map((row) => ({
      dateStr: row.matchDate,
      label: formatDateLabel(row.matchDate),
      count: row.attendedPlayerNames?.length ?? 0,
    }))
  }, [attendanceLogs])

  const maxAttendance = Math.max(...attendanceByDate.map((x) => x.count), 1)
  const nAttendance = attendanceByDate.length

  const attendancePoints = useMemo(() => {
    if (nAttendance === 0) return []
    const divisor = nAttendance > 1 ? nAttendance - 1 : 1
    return attendanceByDate.map(({ label, count }, i) => ({
      x: PAD_LEFT + (plotW / divisor) * i,
      y: PAD_TOP + plotH - (count / maxAttendance) * plotH,
      label,
      count,
    }))
  }, [attendanceByDate, maxAttendance, nAttendance, plotW, plotH])

  const smoothPath = useMemo(() => makeSmoothPath(attendancePoints), [attendancePoints])

  if (nAttendance === 0) return null

  return (
    <section className={CARD_BASE}>
      <h2 className={CARD_TITLE}>경기당 출석 인원 수</h2>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-[140px] min-w-[280px]" preserveAspectRatio="xMidYMid meet">
          {attendancePoints.map((pt, i) => (
            <line
              key={i}
              x1={pt.x}
              y1={PAD_TOP}
              x2={pt.x}
              y2={PAD_TOP + plotH}
              stroke="var(--color-navi-border)"
              strokeOpacity={0.4}
              strokeWidth={0.5}
            />
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <line
              key={r}
              x1={PAD_LEFT}
              y1={PAD_TOP + plotH * (1 - r)}
              x2={PAD_LEFT + plotW}
              y2={PAD_TOP + plotH * (1 - r)}
              stroke="var(--color-navi-border)"
              strokeOpacity={0.4}
              strokeWidth={0.5}
            />
          ))}
          <path d={smoothPath} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {attendancePoints.map((pt, i) => (
            <text
              key={`${pt.label}-${i}`}
              x={pt.x}
              y={CHART_H - 8}
              textAnchor="middle"
              style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}
            >
              {pt.label}
            </text>
          ))}
          {maxAttendance > 0 && (
            <text x={PAD_LEFT - 6} y={PAD_TOP + 4} textAnchor="end" style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}>{maxAttendance}</text>
          )}
          <text x={PAD_LEFT - 6} y={PAD_TOP + plotH + 4} textAnchor="end" style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}>0</text>
        </svg>
      </div>
    </section>
  )
}
