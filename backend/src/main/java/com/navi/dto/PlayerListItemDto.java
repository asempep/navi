package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 관리자용 선수 목록 한 건 (전화번호 수정용) */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerListItemDto {
    private Long id;
    private String name;
    private String phoneNumber;
}
