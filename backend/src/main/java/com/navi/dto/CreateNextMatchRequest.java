package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/** 다음 경기 등록/수정 요청 DTO */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNextMatchRequest {
    /** 경기일 (필수) */
    private LocalDate matchDate;
    /** 경기 시간 (선택) */
    private LocalTime matchTime;
    /** 상대팀 (필수) */
    private String opponent;
    /** 경기장/장소 (선택) */
    private String venue;
    /** 비고 (선택) */
    private String memo;
}
