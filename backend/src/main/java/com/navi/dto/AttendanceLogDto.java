package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/** 경기별 출석 현황 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceLogDto {
    private Long matchId;
    private LocalDate matchDate;
    private String opponent;
    private List<String> attendedPlayerNames;
}
