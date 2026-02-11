package com.navi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 선수 전화번호 수정 요청 본문 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePlayerPhoneRequest {
    private String phoneNumber;
}
