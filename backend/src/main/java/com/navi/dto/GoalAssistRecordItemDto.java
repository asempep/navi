package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 경기 등록 시 골/도움 한 건 (선수별) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalAssistRecordItemDto {
    private Long playerId;
    private int goals;
    private int assists;
}
