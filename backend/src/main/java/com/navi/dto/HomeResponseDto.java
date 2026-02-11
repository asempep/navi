package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** 홈 화면 응답: 시즌전적 + 다음 경기 + 득점/도움/출석 순위 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeResponseDto {
    private SeasonStatsDto seasonStats;
    private List<NextMatchDto> nextMatches;
    private List<RankingDto> goalRanking;
    private List<RankingDto> assistRanking;
    private List<RankingDto> attendanceRanking;
}
