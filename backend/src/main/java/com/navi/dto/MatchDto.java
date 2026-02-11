package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/** 경기 정보 응답 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchDto {
    private Long id;
    private LocalDate matchDate;
    private LocalTime matchTime;
    private String opponent;
    private int ourScore;
    private int opponentScore;
    private String result;
}
