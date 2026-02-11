package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 시즌 전적 응답 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeasonStatsDto {
    private int seasonYear;
    private int totalMatches;
    private int wins;
    private int draws;
    private int losses;
}
