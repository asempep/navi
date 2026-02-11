package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/** 다음 경기 응답 DTO */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NextMatchDto {
    private Long id;
    private LocalDate matchDate;
    private LocalTime matchTime;
    private String opponent;
    private String venue;
    private String memo;
}
