package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** 경기 등록 요청 (경기일, 상대팀, 스코어, 참석자, 골/도움 기록) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMatchRequest {
    /** 경기일 */
    private LocalDate matchDate;
    /** 경기 시간 (선택, HH:mm) */
    private LocalTime matchTime;
    /** 상대팀 */
    private String opponent;
    /** 우리 팀 득점 */
    private int ourScore;
    /** 상대팀 득점 */
    private int opponentScore;
    /** 참석한 선수 ID 목록 */
    private List<Long> attendeePlayerIds = new ArrayList<>();
    /** 골/도움 기록 (선수별) */
    private List<GoalAssistRecordItemDto> goalAssistRecords = new ArrayList<>();
}
