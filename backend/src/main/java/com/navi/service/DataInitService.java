package com.navi.service;

import com.navi.entity.*;
import com.navi.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * DB가 비어 있을 때만 초기 데이터 삽입 (프로필 무관, 기동 시 1회)
 * 1) resources/data/*.csv 가 있으면 CSV 기반 시드
 * 2) 없거나 실패 시 하드코딩 데이터 사용
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitService implements ApplicationRunner {

    private final CsvSeedService csvSeedService;
    private final SeasonStatsRepository seasonStatsRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;
    private final MatchGoalAssistRepository goalAssistRepository;
    private final MatchAttendanceRepository attendanceRepository;
    private final NextMatchRepository nextMatchRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (seasonStatsRepository.count() > 0) return;

        try {
            if (csvSeedService.seedIfEmpty()) return;
        } catch (Exception e) {
            log.warn("CSV 시드 실패, 하드코딩 데이터로 진행합니다: {}", e.getMessage());
        }
        if (seasonStatsRepository.count() > 0) return;

        // 폴백: 시즌 전적 2경기 0승 2패
        seasonStatsRepository.save(SeasonStats.builder()
                .seasonYear(2026)
                .totalMatches(2)
                .wins(0)
                .draws(0)
                .losses(2)
                .build());

        List<String> playerNames = List.of(
                "민성우", "정준희", "김재린", "송민규", "양승운", "박승재", "김채운", "장현규", "전찬일", "김재헌",
                "박성준", "방홍석", "이승준", "김태운", "김시형", "김강엽", "우형오", "류성우", "안진석", "이재원",
                "정민철", "이규호", "배재빈", "강지구", "권준", "정봉원", "펠릭스", "오경택", "오상우", "이민형", "장채운", "도나"
        );
        for (String name : playerNames) {
            playerRepository.findByName(name).orElseGet(() -> playerRepository.save(Player.builder().name(name).build()));
        }

        // 경기 1: 2026-01-11 vs 찢자fc 1:4 패
        Match m1 = matchRepository.save(Match.builder()
                .matchDate(LocalDate.of(2026, 1, 11))
                .opponent("찢자fc")
                .ourScore(1)
                .opponentScore(4)
                .result("패")
                .build());
        addGoalAssist(m1, "장현규", 1, 0);
        addGoalAssist(m1, "우형오", 0, 1);
        String[] attend1 = {"민성우", "김재린", "송민규", "양승운", "박승재", "김채운", "장현규", "박성준", "이승준", "김태운", "우형오", "류성우", "배재빈", "이민형"};
        addAttendance(m1, attend1);

        // 경기 2: 2026-01-18 vs 라온fc 2:4 패
        Match m2 = matchRepository.save(Match.builder()
                .matchDate(LocalDate.of(2026, 1, 18))
                .opponent("라온fc")
                .ourScore(2)
                .opponentScore(4)
                .result("패")
                .build());
        addGoalAssist(m2, "송민규", 2, 0);
        addGoalAssist(m2, "박성준", 0, 1);
        addGoalAssist(m2, "김재린", 0, 1);
        String[] attend2 = {"민성우", "정준희", "김재린", "송민규", "양승운", "박승재", "장현규", "전찬일", "박성준", "김태운", "김시형", "우형오", "류성우"};
        addAttendance(m2, attend2);

        // 다음 경기 (폴백 시)
        if (nextMatchRepository.count() == 0) {
            nextMatchRepository.save(NextMatch.builder()
                    .matchDate(LocalDate.of(2026, 2, 15))
                    .matchTime(LocalTime.of(14, 0))
                    .opponent("다음 상대팀")
                    .venue("홈 경기장")
                    .memo("")
                    .build());
        }
    }

    private void addGoalAssist(Match match, String playerName, int goals, int assists) {
        Player p = playerRepository.findByName(playerName).orElseThrow();
        goalAssistRepository.save(MatchGoalAssist.builder()
                .match(match)
                .player(p)
                .goals(goals)
                .assists(assists)
                .build());
    }

    private void addAttendance(Match match, String[] names) {
        for (String name : names) {
            playerRepository.findByName(name).ifPresent(p ->
                    attendanceRepository.save(MatchAttendance.builder()
                            .match(match)
                            .player(p)
                            .attended(true)
                            .build()));
        }
    }
}
