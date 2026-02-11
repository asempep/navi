package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** 경기 상세 (수정 폼용: 경기 정보 + 참석자 + 골/도움 기록) */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchDetailDto {
    private Long id;
    private LocalDate matchDate;
    private LocalTime matchTime;
    private String opponent;
    private int ourScore;
    private int opponentScore;
    private List<Long> attendeePlayerIds = new ArrayList<>();
    private List<GoalAssistRecordItemDto> goalAssistRecords = new ArrayList<>();
}
