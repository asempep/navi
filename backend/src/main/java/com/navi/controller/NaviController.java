package com.navi.controller;

import com.navi.dto.*;
import com.navi.service.CsvSeedService;
import com.navi.service.NaviService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * NAVI 시즌 전적 API
 * - GET /api/home : 홈 (시즌전적, 득점/도움/출석 순위)
 * - GET /api/matches : 전체 경기
 * - GET /api/goals : 골 로그
 * - GET /api/assists : 도움 로그
 * - GET /api/attendance : 출석 로그
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NaviController {

    private final NaviService naviService;
    private final CsvSeedService csvSeedService;

    @GetMapping("/home")
    public ResponseEntity<HomeResponseDto> getHome() {
        return ResponseEntity.ok(naviService.getHome());
    }

    @GetMapping("/matches")
    public ResponseEntity<List<MatchDto>> getMatches() {
        return ResponseEntity.ok(naviService.getAllMatches());
    }

    @GetMapping("/goals")
    public ResponseEntity<List<GoalAssistLogDto>> getGoalLogs() {
        return ResponseEntity.ok(naviService.getGoalLogs());
    }

    @GetMapping("/assists")
    public ResponseEntity<List<GoalAssistLogDto>> getAssistLogs() {
        return ResponseEntity.ok(naviService.getAssistLogs());
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<AttendanceLogDto>> getAttendanceLogs() {
        return ResponseEntity.ok(naviService.getAttendanceLogs());
    }

    /** 선수 상세 정보 (출석, 골, 도움, 전화번호 + 참가한 경기 목록) */
    @GetMapping("/player/{name}")
    public ResponseEntity<PlayerDetailDto> getPlayerDetail(@PathVariable String name) {
        return naviService.getPlayerDetail(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** 관리자용: 전체 선수 목록 (전화번호 수정용) */
    @GetMapping("/players")
    public ResponseEntity<List<PlayerListItemDto>> getPlayers() {
        return ResponseEntity.ok(naviService.getPlayers());
    }

    /** 선수 전화번호 수정 */
    @PatchMapping("/player/id/{id}")
    public ResponseEntity<PlayerListItemDto> updatePlayerPhone(
            @PathVariable Long id,
            @RequestBody UpdatePlayerPhoneRequest body) {
        return naviService.updatePlayerPhone(id, body != null ? body.getPhoneNumber() : null)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** 경기 등록 (경기일, 상대팀, 스코어, 참석자, 골/도움 기록) */
    @PostMapping("/matches")
    public ResponseEntity<MatchDto> createMatch(@RequestBody CreateMatchRequest body) {
        return ResponseEntity.ok(naviService.createMatch(body));
    }

    /** 경기 상세 (수정 폼용) */
    @GetMapping("/matches/{id}")
    public ResponseEntity<MatchDetailDto> getMatchDetail(@PathVariable Long id) {
        return naviService.getMatchDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** 경기 수정 */
    @PutMapping("/matches/{id}")
    public ResponseEntity<MatchDto> updateMatch(@PathVariable Long id, @RequestBody CreateMatchRequest body) {
        return ResponseEntity.ok(naviService.updateMatch(id, body));
    }

    /** 경기 삭제 */
    @DeleteMapping("/matches/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Long id) {
        naviService.deleteMatch(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- 다음 경기 (홈 화면 "다음 경기" 섹션용) ----------

    /** 관리자용: 다음 경기 목록 */
    @GetMapping("/next-matches")
    public ResponseEntity<List<NextMatchDto>> getNextMatches() {
        return ResponseEntity.ok(naviService.getNextMatches());
    }

    /** 다음 경기 등록 */
    @PostMapping("/next-matches")
    public ResponseEntity<NextMatchDto> createNextMatch(@RequestBody CreateNextMatchRequest body) {
        return ResponseEntity.ok(naviService.createNextMatch(body));
    }

    /** 다음 경기 수정 */
    @PutMapping("/next-matches/{id}")
    public ResponseEntity<NextMatchDto> updateNextMatch(@PathVariable Long id, @RequestBody CreateNextMatchRequest body) {
        return ResponseEntity.ok(naviService.updateNextMatch(id, body));
    }

    /** 다음 경기 삭제 */
    @DeleteMapping("/next-matches/{id}")
    public ResponseEntity<Void> deleteNextMatch(@PathVariable Long id) {
        naviService.deleteNextMatch(id);
        return ResponseEntity.noContent().build();
    }

    /** CSV 데이터를 DB에 넣기 (DB 비어 있을 때만 동작, 브라우저에서 이 URL 한 번 호출) */
    @GetMapping("/admin/seed-csv")
    public ResponseEntity<Map<String, Object>> seedFromCsv() {
        boolean done = csvSeedService.seedIfEmpty();
        return ResponseEntity.ok(Map.of(
                "done", done,
                "message", done ? "CSV 데이터를 DB에 넣었습니다." : "이미 데이터가 있거나 CSV 리소스가 없습니다."
        ));
    }
}
