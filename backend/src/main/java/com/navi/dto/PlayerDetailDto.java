package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/** 선수 상세 정보 (출석, 골, 도움, 전화번호 + 참가한 경기 목록) */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerDetailDto {
    private String playerName;
    private int attendance;
    private int goals;
    private int assists;
    private String phoneNumber;
    @Builder.Default
    private List<PlayerMatchRecordDto> matchRecords = new ArrayList<>();
}
