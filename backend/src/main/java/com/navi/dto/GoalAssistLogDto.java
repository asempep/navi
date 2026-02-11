package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** 경기별 골/도움 로그 한 줄 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalAssistLogDto {
    private Long matchId;
    private LocalDate matchDate;
    private String opponent;
    private String playerName;
    private int goals;
    private int assists;
}
