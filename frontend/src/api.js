const API_BASE = '/api';

export async function fetchHome() {
  const res = await fetch(`${API_BASE}/home`);
  if (!res.ok) throw new Error('홈 데이터 로드 실패');
  return res.json();
}

export async function fetchMatches() {
  const res = await fetch(`${API_BASE}/matches`);
  if (!res.ok) throw new Error('경기 목록 로드 실패');
  return res.json();
}

export async function fetchGoalLogs() {
  const res = await fetch(`${API_BASE}/goals`);
  if (!res.ok) throw new Error('골 로그 로드 실패');
  return res.json();
}

export async function fetchAssistLogs() {
  const res = await fetch(`${API_BASE}/assists`);
  if (!res.ok) throw new Error('도움 로그 로드 실패');
  return res.json();
}

export async function fetchAttendanceLogs() {
  const res = await fetch(`${API_BASE}/attendance`);
  if (!res.ok) throw new Error('출석 로그 로드 실패');
  return res.json();
}

/** 선수 상세 정보 (출석, 골, 도움, 전화번호 + 참가한 경기) */
export async function fetchPlayerDetail(playerName) {
  const encoded = encodeURIComponent(playerName);
  const res = await fetch(`${API_BASE}/player/${encoded}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('선수 정보 로드 실패');
  }
  return res.json();
}

/** 관리자용: 전체 선수 목록 (전화번호 수정용) */
export async function fetchPlayers() {
  const res = await fetch(`${API_BASE}/players`);
  if (!res.ok) throw new Error('선수 목록 로드 실패');
  return res.json();
}

/** 선수 전화번호 수정 */
export async function updatePlayerPhone(playerId, phoneNumber) {
  const res = await fetch(`${API_BASE}/player/id/${playerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: phoneNumber || '' }),
  });
  if (!res.ok) throw new Error('전화번호 저장 실패');
  return res.json();
}

/**
 * 경기 등록 (경기일, 상대팀, 스코어, 참석자, 골/도움 기록)
 * @param {Object} body - { matchDate, opponent, ourScore, opponentScore, attendeePlayerIds, goalAssistRecords }
 */
export async function createMatch(body) {
  const res = await fetch(`${API_BASE}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || '경기 등록 실패');
  }
  return res.json();
}

/** 경기 상세 (수정 폼용) */
export async function fetchMatchDetail(matchId) {
  const res = await fetch(`${API_BASE}/matches/${matchId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('경기 정보 로드 실패');
  }
  return res.json();
}

/** 경기 수정 */
export async function updateMatch(matchId, body) {
  const res = await fetch(`${API_BASE}/matches/${matchId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || '경기 수정 실패');
  }
  return res.json();
}

/** 경기 삭제 */
export async function deleteMatch(matchId) {
  const res = await fetch(`${API_BASE}/matches/${matchId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('경기 삭제 실패');
}
