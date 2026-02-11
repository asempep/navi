package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 순위 한 줄 (선수명, 수치) */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankingDto {
    private int rank;
    private String playerName;
    private int value;
}
