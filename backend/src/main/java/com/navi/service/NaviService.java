package com.navi.service;

import com.navi.dto.*;
import com.navi.entity.*;
import com.navi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 홈/순위/경기/골/도움/출석 데이터 조회
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NaviService {

    private final SeasonStatsRepository seasonStatsRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;
    private final MatchGoalAssistRepository goalAssistRepository;
    private final MatchAttendanceRepository attendanceRepository;
    private final NextMatchRepository nextMatchRepository;

    /** 홈 화면: 시즌 전적 + 다음 경기 + 득점/도움/출석 순위 */
    public HomeResponseDto getHome() {
        SeasonStatsDto season = getSeasonStats();
        List<NextMatchDto> nextMatches = getNextMatches();
        List<RankingDto> goalRanking = getGoalRanking();
        List<RankingDto> assistRanking = getAssistRanking();
        List<RankingDto> attendanceRanking = getAttendanceRanking();
        return HomeResponseDto.builder()
                .seasonStats(season)
                .nextMatches(nextMatches)
                .goalRanking(goalRanking)
                .assistRanking(assistRanking)
                .attendanceRanking(attendanceRanking)
                .build();
    }

    /** 다음 경기 목록 (경기일 오름차순) */
    private List<NextMatchDto> getNextMatches() {
        return nextMatchRepository.findAllByOrderByMatchDateAsc().stream()
                .map(m -> NextMatchDto.builder()
                        .id(m.getId())
                        .matchDate(m.getMatchDate())
                        .matchTime(m.getMatchTime())
                        .opponent(m.getOpponent())
                        .venue(m.getVenue())
                        .memo(m.getMemo())
                        .build())
                .toList();
    }

    private SeasonStatsDto getSeasonStats() {
        return seasonStatsRepository.findTopByOrderBySeasonYearDesc()
                .map(s -> SeasonStatsDto.builder()
                        .seasonYear(s.getSeasonYear())
                        .totalMatches(s.getTotalMatches())
                        .wins(s.getWins())
                        .draws(s.getDraws())
                        .losses(s.getLosses())
                        .build())
                .orElse(SeasonStatsDto.builder()
                        .seasonYear(java.time.Year.now().getValue())
                        .totalMatches(0).wins(0).draws(0).losses(0)
                        .build());
    }

    /** 선수별 총 골 수 집계 후 순위 */
    private List<RankingDto> getGoalRanking() {
        Map<Long, Integer> playerGoals = new HashMap<>();
        goalAssistRepository.findAll().forEach(mga -> {
            Long pid = mga.getPlayer().getId();
            playerGoals.merge(pid, mga.getGoals(), Integer::sum);
        });
        return toRankingList(playerGoals, true);
    }

    /** 선수별 총 도움 수 집계 후 순위 */
    private List<RankingDto> getAssistRanking() {
        Map<Long, Integer> playerAssists = new HashMap<>();
        goalAssistRepository.findAll().forEach(mga -> {
            Long pid = mga.getPlayer().getId();
            playerAssists.merge(pid, mga.getAssists(), Integer::sum);
        });
        return toRankingList(playerAssists, true);
    }

    /** 선수별 출석 횟수 집계 후 순위 */
    private List<RankingDto> getAttendanceRanking() {
        Map<Long, Integer> playerAttendance = new HashMap<>();
        attendanceRepository.findAll().stream()
                .filter(MatchAttendance::isAttended)
                .forEach(ma -> {
                    Long pid = ma.getPlayer().getId();
                    playerAttendance.merge(pid, 1, Integer::sum);
                });
        return toRankingList(playerAttendance, true);
    }

    private List<RankingDto> toRankingList(Map<Long, Integer> playerToValue, boolean descending) {
        List<Map.Entry<Long, Integer>> sorted = playerToValue.entrySet().stream()
                .sorted(descending
                        ? Map.Entry.<Long, Integer>comparingByValue().reversed()
                        : Map.Entry.comparingByValue())
                .toList();
        Map<Long, String> idToName = new HashMap<>();
        playerRepository.findAll().forEach(p -> idToName.put(p.getId(), p.getName()));
        List<RankingDto> result = new ArrayList<>();
        int rank = 1;
        for (Map.Entry<Long, Integer> e : sorted) {
            result.add(RankingDto.builder()
                    .rank(rank++)
                    .playerName(idToName.getOrDefault(e.getKey(), "?"))
                    .value(e.getValue())
                    .build());
        }
        return result;
    }

    /** 전체 경기 목록 */
    public List<MatchDto> getAllMatches() {
        return matchRepository.findAllByOrderByMatchDateDesc().stream()
                .map(m -> MatchDto.builder()
                        .id(m.getId())
                        .matchDate(m.getMatchDate())
                        .matchTime(m.getMatchTime())
                        .opponent(m.getOpponent())
                        .ourScore(m.getOurScore())
                        .opponentScore(m.getOpponentScore())
                        .result(m.getResult())
                        .build())
                .toList();
    }

    /** 골 탭: 경기별 골/도움 로그 (골 있음 위주) */
    public List<GoalAssistLogDto> getGoalLogs() {
        List<GoalAssistLogDto> list = new ArrayList<>();
        for (Match m : matchRepository.findAllByOrderByMatchDateDesc()) {
            goalAssistRepository.findByMatchIdOrderByGoalsDescAssistsDesc(m.getId()).stream()
                    .filter(mga -> mga.getGoals() > 0 || mga.getAssists() > 0)
                    .forEach(mga -> list.add(GoalAssistLogDto.builder()
                            .matchId(m.getId())
                            .matchDate(m.getMatchDate())
                            .opponent(m.getOpponent())
                            .playerName(mga.getPlayer().getName())
                            .goals(mga.getGoals())
                            .assists(mga.getAssists())
                            .build()));
        }
        return list;
    }

    /** 도움 탭: 동일 로그 (도움 있음도 포함되어 있음) */
    public List<GoalAssistLogDto> getAssistLogs() {
        return getGoalLogs();
    }

    /** 선수 상세 정보 (출석, 골, 도움, 전화번호 + 참가한 경기별 기록) */
    public Optional<PlayerDetailDto> getPlayerDetail(String playerName) {
        if (playerName == null || playerName.isBlank()) return Optional.empty();
        return playerRepository.findByName(playerName.trim())
                .map(player -> {
                    long playerId = player.getId();
                    // 경기별 골/어시 (선수 기준)
                    Map<Long, MatchGoalAssist> gaByMatch = goalAssistRepository.findAllByPlayerId(playerId).stream()
                            .collect(Collectors.toMap(mga -> mga.getMatch().getId(), Function.identity(), (a, b) -> a));
                    int goals = gaByMatch.values().stream().mapToInt(MatchGoalAssist::getGoals).sum();
                    int assists = gaByMatch.values().stream().mapToInt(MatchGoalAssist::getAssists).sum();
                    // 출석한 경기 ID 목록
                    Set<Long> attendedMatchIds = attendanceRepository.findAll().stream()
                            .filter(ma -> ma.getPlayer().getId().equals(playerId) && ma.isAttended())
                            .map(ma -> ma.getMatch().getId())
                            .collect(Collectors.toSet());
                    long attendance = attendedMatchIds.size();
                    // 참가한 경기 목록 (날짜 내림차순, 경기별 골/어시)
                    List<PlayerMatchRecordDto> matchRecords = matchRepository.findAllByOrderByMatchDateDesc().stream()
                            .filter(m -> attendedMatchIds.contains(m.getId()))
                            .map(m -> {
                                MatchGoalAssist ga = gaByMatch.get(m.getId());
                                return PlayerMatchRecordDto.builder()
                                        .matchId(m.getId())
                                        .matchDate(m.getMatchDate())
                                        .opponent(m.getOpponent())
                                        .goals(ga != null ? ga.getGoals() : 0)
                                        .assists(ga != null ? ga.getAssists() : 0)
                                        .attended(true)
                                        .build();
                            })
                            .toList();
                    return PlayerDetailDto.builder()
                            .playerName(player.getName())
                            .attendance((int) attendance)
                            .goals(goals)
                            .assists(assists)
                            .phoneNumber(player.getPhoneNumber())
                            .matchRecords(matchRecords)
                            .build();
                });
    }

    /** 관리자용: 전체 선수 목록 (전화번호 수정용) */
    public List<PlayerListItemDto> getPlayers() {
        return playerRepository.findAll().stream()
                .sorted(Comparator.comparing(Player::getName))
                .map(p -> PlayerListItemDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .phoneNumber(p.getPhoneNumber())
                        .build())
                .toList();
    }

    /** 선수 전화번호 수정 */
    @Transactional
    public Optional<PlayerListItemDto> updatePlayerPhone(Long id, String phoneNumber) {
        return playerRepository.findById(id)
                .map(player -> {
                    player.setPhoneNumber(phoneNumber != null && !phoneNumber.isBlank() ? phoneNumber.trim() : null);
                    return PlayerListItemDto.builder()
                            .id(player.getId())
                            .name(player.getName())
                            .phoneNumber(player.getPhoneNumber())
                            .build();
                });
    }

    /** 출석 탭: 경기별 출석 선수 목록 */
    public List<AttendanceLogDto> getAttendanceLogs() {
        return matchRepository.findAllByOrderByMatchDateDesc().stream()
                .map(m -> {
                    List<String> names = attendanceRepository.findByMatchId(m.getId()).stream()
                            .filter(MatchAttendance::isAttended)
                            .map(ma -> ma.getPlayer().getName())
                            .sorted()
                            .toList();
                    return AttendanceLogDto.builder()
                            .matchId(m.getId())
                            .matchDate(m.getMatchDate())
                            .opponent(m.getOpponent())
                            .attendedPlayerNames(names)
                            .build();
                })
                .toList();
    }

    /** 경기 등록 (경기 정보 + 참석자 + 골/도움 기록, 시즌 전적 반영) */
    @Transactional
    public MatchDto createMatch(com.navi.dto.CreateMatchRequest req) {
        if (req == null || req.getMatchDate() == null) {
            throw new IllegalArgumentException("경기일은 필수입니다.");
        }
        // 승/무/패 계산
        String result = "무";
        if (req.getOurScore() > req.getOpponentScore()) result = "승";
        else if (req.getOurScore() < req.getOpponentScore()) result = "패";

        Match match = Match.builder()
                .matchDate(req.getMatchDate())
                .matchTime(req.getMatchTime())
                .opponent(req.getOpponent() != null ? req.getOpponent().trim() : "")
                .ourScore(req.getOurScore())
                .opponentScore(req.getOpponentScore())
                .result(result)
                .build();
        final Match savedMatch = matchRepository.save(match);

        List<Long> attendeeIds = req.getAttendeePlayerIds() != null ? req.getAttendeePlayerIds() : List.of();
        for (Long playerId : attendeeIds) {
            playerRepository.findById(playerId).ifPresent(player ->
                    attendanceRepository.save(MatchAttendance.builder()
                            .match(savedMatch)
                            .player(player)
                            .attended(true)
                            .build()));
        }

        List<com.navi.dto.GoalAssistRecordItemDto> records = req.getGoalAssistRecords() != null ? req.getGoalAssistRecords() : List.of();
        for (com.navi.dto.GoalAssistRecordItemDto item : records) {
            if (item.getPlayerId() == null) continue;
            if (item.getGoals() == 0 && item.getAssists() == 0) continue;
            playerRepository.findById(item.getPlayerId()).ifPresent(player ->
                    goalAssistRepository.save(MatchGoalAssist.builder()
                            .match(savedMatch)
                            .player(player)
                            .goals(Math.max(0, item.getGoals()))
                            .assists(Math.max(0, item.getAssists()))
                            .build()));
        }

        int year = req.getMatchDate().getYear();
        SeasonStats stats = seasonStatsRepository.findBySeasonYear(year)
                .orElseGet(() -> {
                    SeasonStats newStats = SeasonStats.builder().seasonYear(year).build();
                    return seasonStatsRepository.save(newStats);
                });
        stats.setTotalMatches(stats.getTotalMatches() + 1);
        if ("승".equals(result)) stats.setWins(stats.getWins() + 1);
        else if ("무".equals(result)) stats.setDraws(stats.getDraws() + 1);
        else stats.setLosses(stats.getLosses() + 1);
        seasonStatsRepository.save(stats);

        return MatchDto.builder()
                .id(savedMatch.getId())
                .matchDate(savedMatch.getMatchDate())
                .matchTime(savedMatch.getMatchTime())
                .opponent(savedMatch.getOpponent())
                .ourScore(savedMatch.getOurScore())
                .opponentScore(savedMatch.getOpponentScore())
                .result(savedMatch.getResult())
                .build();
    }

    /** 경기 상세 (수정 폼용: 참석자·골/도움 포함) */
    public Optional<MatchDetailDto> getMatchDetail(Long matchId) {
        return matchRepository.findById(matchId)
                .map(match -> {
                    List<Long> attendeeIds = attendanceRepository.findByMatchId(match.getId()).stream()
                            .map(ma -> ma.getPlayer().getId())
                            .toList();
                    List<GoalAssistRecordItemDto> records = goalAssistRepository.findByMatchIdOrderByGoalsDescAssistsDesc(match.getId()).stream()
                            .map(mga -> new GoalAssistRecordItemDto(mga.getPlayer().getId(), mga.getGoals(), mga.getAssists()))
                            .toList();
                    return MatchDetailDto.builder()
                            .id(match.getId())
                            .matchDate(match.getMatchDate())
                            .matchTime(match.getMatchTime())
                            .opponent(match.getOpponent())
                            .ourScore(match.getOurScore())
                            .opponentScore(match.getOpponentScore())
                            .attendeePlayerIds(attendeeIds)
                            .goalAssistRecords(records.isEmpty() ? List.of() : records)
                            .build();
                });
    }

    /** 시즌 전적에서 한 경기 분량 감소 */
    private void decrementSeasonStats(int year, String result) {
        seasonStatsRepository.findBySeasonYear(year).ifPresent(stats -> {
            stats.setTotalMatches(Math.max(0, stats.getTotalMatches() - 1));
            if ("승".equals(result)) stats.setWins(Math.max(0, stats.getWins() - 1));
            else if ("무".equals(result)) stats.setDraws(Math.max(0, stats.getDraws() - 1));
            else stats.setLosses(Math.max(0, stats.getLosses() - 1));
            seasonStatsRepository.save(stats);
        });
    }

    /** 경기 수정 (경기 정보·참석자·골/도움 갱신, 시즌 전적 반영) */
    @Transactional
    public MatchDto updateMatch(Long matchId, CreateMatchRequest req) {
        if (req == null || req.getMatchDate() == null) {
            throw new IllegalArgumentException("경기일은 필수입니다.");
        }
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("경기를 찾을 수 없습니다."));

        int oldYear = match.getMatchDate().getYear();
        String oldResult = match.getResult();
        decrementSeasonStats(oldYear, oldResult);

        String result = "무";
        if (req.getOurScore() > req.getOpponentScore()) result = "승";
        else if (req.getOurScore() < req.getOpponentScore()) result = "패";

        match.setMatchDate(req.getMatchDate());
        match.setMatchTime(req.getMatchTime());
        match.setOpponent(req.getOpponent() != null ? req.getOpponent().trim() : "");
        match.setOurScore(req.getOurScore());
        match.setOpponentScore(req.getOpponentScore());
        match.setResult(result);
        final Match savedMatch = matchRepository.save(match);

        attendanceRepository.findByMatchId(matchId).forEach(attendanceRepository::delete);
        List<Long> attendeeIds = req.getAttendeePlayerIds() != null ? req.getAttendeePlayerIds() : List.of();
        for (Long playerId : attendeeIds) {
            playerRepository.findById(playerId).ifPresent(player ->
                    attendanceRepository.save(MatchAttendance.builder()
                            .match(savedMatch)
                            .player(player)
                            .attended(true)
                            .build()));
        }

        goalAssistRepository.findByMatchIdOrderByGoalsDescAssistsDesc(matchId).forEach(goalAssistRepository::delete);
        List<GoalAssistRecordItemDto> records = req.getGoalAssistRecords() != null ? req.getGoalAssistRecords() : List.of();
        for (GoalAssistRecordItemDto item : records) {
            if (item.getPlayerId() == null) continue;
            if (item.getGoals() == 0 && item.getAssists() == 0) continue;
            playerRepository.findById(item.getPlayerId()).ifPresent(player ->
                    goalAssistRepository.save(MatchGoalAssist.builder()
                            .match(savedMatch)
                            .player(player)
                            .goals(Math.max(0, item.getGoals()))
                            .assists(Math.max(0, item.getAssists()))
                            .build()));
        }

        int newYear = req.getMatchDate().getYear();
        SeasonStats stats = seasonStatsRepository.findBySeasonYear(newYear)
                .orElseGet(() -> {
                    SeasonStats newStats = SeasonStats.builder().seasonYear(newYear).build();
                    return seasonStatsRepository.save(newStats);
                });
        stats.setTotalMatches(stats.getTotalMatches() + 1);
        if ("승".equals(result)) stats.setWins(stats.getWins() + 1);
        else if ("무".equals(result)) stats.setDraws(stats.getDraws() + 1);
        else stats.setLosses(stats.getLosses() + 1);
        seasonStatsRepository.save(stats);

        return MatchDto.builder()
                .id(savedMatch.getId())
                .matchDate(savedMatch.getMatchDate())
                .matchTime(savedMatch.getMatchTime())
                .opponent(savedMatch.getOpponent())
                .ourScore(savedMatch.getOurScore())
                .opponentScore(savedMatch.getOpponentScore())
                .result(savedMatch.getResult())
                .build();
    }

    /** 경기 삭제 (참석·골/도움 함께 삭제, 시즌 전적 반영) */
    @Transactional
    public void deleteMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("경기를 찾을 수 없습니다."));
        int year = match.getMatchDate().getYear();
        String result = match.getResult();
        attendanceRepository.findByMatchId(matchId).forEach(attendanceRepository::delete);
        goalAssistRepository.findByMatchIdOrderByGoalsDescAssistsDesc(matchId).forEach(goalAssistRepository::delete);
        matchRepository.delete(match);
        decrementSeasonStats(year, result);
    }
}
