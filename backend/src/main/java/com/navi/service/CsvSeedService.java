package com.navi.service;

import com.navi.entity.*;
import com.navi.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * classpath의 data/*.csv 를 읽어 DB에 초기 데이터 시드
 * (resources/data/ 에 CSV 배치 후 init 프로필 실행 시 사용)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CsvSeedService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy. M. d");
    private static final DateTimeFormatter DATE_FORMAT_NO_SPACE = DateTimeFormatter.ofPattern("yyyy.M.d");
    private static final Pattern GOAL_PATTERN = Pattern.compile("(\\d+)골");
    private static final Pattern ASSIST_PATTERN = Pattern.compile("(\\d+)도움");

    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;
    private final MatchAttendanceRepository attendanceRepository;
    private final MatchGoalAssistRepository goalAssistRepository;
    private final SeasonStatsRepository seasonStatsRepository;
    private final NextMatchRepository nextMatchRepository;

    /** 이미 데이터가 있으면 시드하지 않음. CSV 리소스 없거나 오류 시 false 반환(예외 없음). */
    @Transactional
    public boolean seedIfEmpty() {
        if (seasonStatsRepository.count() > 0) {
            log.info("DB에 이미 데이터가 있어 CSV 시드를 건너뜁니다.");
            return false;
        }
        if (!resourceExists("data/goal_assist.csv")) {
            log.warn("CSV 리소스 없음: data/goal_assist.csv (JAR 내 resources/data/ 확인)");
            return false;
        }
        try {
            seedPlayersFromGoalAssist();
            seedSeasonStatsFromDashboard();
            seedMatchesFromResponse();
            seedNextMatchFromAttendance();
            log.info("CSV 기반 DB 시드 완료.");
            return true;
        } catch (Exception e) {
            log.error("CSV 시드 중 오류 (하드코딩 데이터로 폴백 가능): {}", e.getMessage(), e);
            return false;
        }
    }

    private boolean resourceExists(String path) {
        try {
            return new ClassPathResource(path).exists();
        } catch (Exception e) {
            return false;
        }
    }

    /** 골_도움.csv → 선수 등록 (헤더 BOM/공백 허용) */
    private void seedPlayersFromGoalAssist() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/goal_assist.csv");
        try (var reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().build())) {
            for (CSVRecord record : parser) {
                String name = getFirstColumnOrHeader(record, "선수명");
                if (name == null || name.isEmpty()) continue;
                playerRepository.findByName(name).orElseGet(() ->
                        playerRepository.save(Player.builder().name(name).build()));
            }
        }
    }

    /** 대시보드.csv 4행 → 시즌 전적 (2경기 0승 0무 2패) */
    private void seedSeasonStatsFromDashboard() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/dashboard.csv");
        try (var reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT)) {
            List<CSVRecord> records = parser.getRecords();
            if (records.size() < 4) return;
            CSVRecord row = records.get(3); // 4번째 줄 (0-based 3)
            int total = parseInt(row.get(0), 0);
            int wins = parseInt(row.get(2), 0);
            int draws = parseInt(row.get(4), 0);
            int losses = parseInt(row.get(6), 0);
            seasonStatsRepository.save(SeasonStats.builder()
                    .seasonYear(2026)
                    .totalMatches(total)
                    .wins(wins)
                    .draws(draws)
                    .losses(losses)
                    .build());
        }
    }

    /** 응답.csv → 경기 + 출석 + 골/도움 (헤더 BOM/공백 허용) */
    private void seedMatchesFromResponse() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/response.csv");
        try (var reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().build())) {
            for (CSVRecord record : parser) {
                String dateStr = getColumn(record, "경기일", 1);
                if (dateStr == null || dateStr.isEmpty()) continue;
                LocalDate matchDate = parseDate(dateStr);
                if (matchDate == null) continue;
                String opponent = getColumn(record, "상대팀", 2);
                int ourScore = parseInt(getColumn(record, "우리득점", 6), 0);
                int opponentScore = parseInt(getColumn(record, "상대득점", 7), 0);
                String result = getColumn(record, "판정", 8);

                Match match = matchRepository.save(Match.builder()
                        .matchDate(matchDate)
                        .opponent(opponent)
                        .ourScore(ourScore)
                        .opponentScore(opponentScore)
                        .result(result)
                        .build());

                // 참석자: "민성우, 김재린, ..." → 이름 리스트
                String attendStr = getColumn(record, "참석자", 3);
                if (attendStr != null) {
                    List<String> attendNames = Arrays.stream(attendStr.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.toList());
                    for (String name : attendNames) {
                        playerRepository.findByName(name).ifPresent(p ->
                                attendanceRepository.save(MatchAttendance.builder()
                                        .match(match)
                                        .player(p)
                                        .attended(true)
                                        .build()));
                    }
                }

                // 골/도움 기록: "우형오 1도움\n장현규 1골" 형태 파싱
                String goalAssistStr = getColumn(record, "골도움기록", 4);
                parseGoalAssistLines(match, goalAssistStr != null ? goalAssistStr : "");
            }
        }
    }

    /** BOM 등으로 헤더명이 안 맞을 수 있으므로, 컬럼명 또는 인덱스로 값 조회 */
    private static String getColumn(CSVRecord record, String headerName, int columnIndex) {
        try {
            String v = record.get(headerName);
            if (v != null && !v.isEmpty()) return v.trim();
        } catch (Exception ignored) { }
        try {
            if (record.size() > columnIndex) {
                String v = record.get(columnIndex);
                return v != null ? v.trim() : "";
            }
        } catch (Exception ignored) { }
        return "";
    }

    /** 첫 컬럼 값 또는 '선수명' 헤더 값 (BOM 대응) */
    private static String getFirstColumnOrHeader(CSVRecord record, String headerName) {
        try {
            String v = record.get(headerName);
            if (v != null && !v.isEmpty()) return v.trim();
        } catch (Exception ignored) { }
        try {
            String v = record.get(0);
            return v != null ? v.trim() : "";
        } catch (Exception ignored) { }
        return "";
    }

    /** "선수명 N골" / "선수명 N도움" 줄 단위 파싱 */
    private void parseGoalAssistLines(Match match, String text) {
        if (text.isEmpty()) return;
        for (String line : text.split("\n")) {
            line = line.trim();
            if (line.isEmpty()) continue;
            // "장현규 1골", "우형오 1도움", "송민규 2골" 등
            int idx = line.lastIndexOf(' ');
            if (idx <= 0) continue;
            final String playerName = line.substring(0, idx).trim();
            String rest = line.substring(idx + 1).trim();
            Matcher g = GOAL_PATTERN.matcher(rest);
            Matcher a = ASSIST_PATTERN.matcher(rest);
            final int goalCount = g.find() ? parseInt(g.group(1), 0) : 0;
            final int assistCount = a.find() ? parseInt(a.group(1), 0) : 0;
            if (!playerName.isEmpty() && (goalCount > 0 || assistCount > 0)) {
                playerRepository.findByName(playerName).ifPresent(p ->
                        goalAssistRepository.save(MatchGoalAssist.builder()
                                .match(match)
                                .player(p)
                                .goals(goalCount)
                                .assists(assistCount)
                                .build()));
            }
        }
    }

    /** 출석.csv 1행에서 다음 경기일(2026.2.15 등) 추출 → NextMatch */
    private void seedNextMatchFromAttendance() throws Exception {
        ClassPathResource resource = new ClassPathResource("data/attendance.csv");
        try (var reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT)) {
            List<CSVRecord> records = parser.getRecords();
            if (records.isEmpty()) return;
            CSVRecord firstRow = records.get(0);
            // 1행에서 모든 경기일 추출 후 가장 미래 날짜를 다음 경기로 사용
            LocalDate nextDate = null;
            for (int i = 0; i < firstRow.size(); i++) {
                String cell = firstRow.get(i).trim();
                if (cell.matches("\\d{4}\\.\\s*\\d{1,2}\\.\\s*\\d{1,2}") || cell.matches("\\d{4}\\.\\d{1,2}\\.\\d{1,2}")) {
                    LocalDate d = parseDate(cell);
                    if (d != null && (nextDate == null || d.isAfter(nextDate))) {
                        nextDate = d;
                    }
                }
            }
            if (nextDate != null && nextMatchRepository.count() == 0) {
                nextMatchRepository.save(NextMatch.builder()
                        .matchDate(nextDate)
                        .matchTime(LocalTime.of(14, 0))
                        .opponent("다음 상대팀")
                        .venue("홈 경기장")
                        .memo("")
                        .build());
            }
        }
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isEmpty()) return null;
        try {
            return LocalDate.parse(s.trim().replace(" ", ""), DATE_FORMAT_NO_SPACE);
        } catch (Exception e1) {
            try {
                return LocalDate.parse(s.trim(), DATE_FORMAT);
            } catch (Exception e2) {
                return null;
            }
        }
    }

    private static int parseInt(String s, int defaultValue) {
        if (s == null || s.isEmpty()) return defaultValue;
        try {
            return Integer.parseInt(s.trim().replaceAll("[^0-9-]", ""));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
