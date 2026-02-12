import { useMemo } from 'react'
import { CARD_BASE, CARD_TITLE } from './cardStyles'
import { CHART_W, CHART_H, PAD_LEFT, PAD_TOP, MONTH_LABELS, getPlotSize, makeSmoothPath } from './chartUtils'

/** 홈 2열: 월별 경기 수 라인 차트 */
export default function HomeMonthlyMatchesChart({ matches }) {
  const { plotW, plotH } = getPlotSize()

  const monthlyCounts = useMemo(() => {
    const map = {}
    for (let m = 1; m <= 12; m++) map[m] = 0
    matches.forEach((m) => {
      const date = m.matchDate
      if (!date) return
      const month = typeof date === 'string' ? parseInt(date.slice(5, 7), 10) : date.month || 1
      if (month >= 1 && month <= 12) map[month] = (map[month] || 0) + 1
    })
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => ({ month, count: map[month] || 0 }))
  }, [matches])

  const maxMonthly = Math.max(...monthlyCounts.map((x) => x.count), 1)

  const monthlyPoints = useMemo(() => {
    return monthlyCounts.map(({ month, count }, i) => ({
      x: PAD_LEFT + (plotW / 11) * i,
      y: PAD_TOP + plotH - (count / maxMonthly) * plotH,
      month,
      count,
    }))
  }, [monthlyCounts, maxMonthly, plotW, plotH])

  const smoothPath = useMemo(() => makeSmoothPath(monthlyPoints), [monthlyPoints])

  if (matches.length === 0) return null

  return (
    <section className={CARD_BASE}>
      <h2 className={CARD_TITLE}>월별 경기 수</h2>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-[140px] min-w-[280px]" preserveAspectRatio="xMidYMid meet">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <line
              key={i}
              x1={PAD_LEFT + (plotW / 11) * i}
              y1={PAD_TOP}
              x2={PAD_LEFT + (plotW / 11) * i}
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
          {MONTH_LABELS.map((label, i) => (
            <text
              key={label}
              x={PAD_LEFT + (plotW / 11) * i}
              y={CHART_H - 8}
              textAnchor="middle"
              style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}
            >
              {label.replace('월', '')}
            </text>
          ))}
          {maxMonthly > 0 && (
            <text x={PAD_LEFT - 6} y={PAD_TOP + 4} textAnchor="end" style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}>{maxMonthly}</text>
          )}
          <text x={PAD_LEFT - 6} y={PAD_TOP + plotH + 4} textAnchor="end" style={{ fontFamily: 'inherit', fontSize: 10, fill: 'var(--color-navi-muted)' }}>0</text>
        </svg>
      </div>
    </section>
  )
}
