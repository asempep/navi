/** 홈 차트 공통: 크기 및 스무스 곡선 경로 */

export const CHART_W = 320
export const CHART_H = 140
export const PAD_LEFT = 36
export const PAD_RIGHT = 12
export const PAD_TOP = 14
export const PAD_BOTTOM = 28

export function getPlotSize() {
  return {
    plotW: CHART_W - PAD_LEFT - PAD_RIGHT,
    plotH: CHART_H - PAD_TOP - PAD_BOTTOM,
  }
}

/** 포인트 배열을 스무스 베지어 경로 문자열로 변환 */
export function makeSmoothPath(points) {
  if (!points || points.length < 2) return points.length === 1 ? `M ${points[0].x} ${points[0].y}` : ''
  const to = (p) => `${p.x} ${p.y}`
  let d = `M ${to(points[0])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${to(p2)}`
  }
  return d
}

/** 라인 아래 영역을 닫은 경로 (그라데이션 채우기용) */
export function makeSmoothAreaPath(points, bottomY) {
  if (!points || points.length < 2) return ''
  const linePath = makeSmoothPath(points)
  const last = points[points.length - 1]
  const first = points[0]
  return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`
}

export const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
