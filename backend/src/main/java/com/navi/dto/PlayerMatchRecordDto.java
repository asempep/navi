package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** 선수가 참가한 경기 한 건 (경기별 골/어시/출석) */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerMatchRecordDto {
    private Long matchId;
    private LocalDate matchDate;
    private String opponent;
    private int goals;
    private int assists;
    private boolean attended;
}
