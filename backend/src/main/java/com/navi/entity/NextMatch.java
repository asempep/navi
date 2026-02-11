package com.navi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 다음 경기 정보 (홈 화면 "다음 경기" 섹션용)
 */
@Entity
@Table(name = "next_match")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NextMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 경기일 */
    @Column(name = "match_date", nullable = false)
    private LocalDate matchDate;

    /** 경기 시간 (선택) */
    @Column(name = "match_time")
    private LocalTime matchTime;

    /** 상대팀 */
    @Column(nullable = false, length = 100)
    private String opponent;

    /** 경기장/장소 (선택) */
    @Column(length = 200)
    private String venue;

    /** 비고 (선택) */
    @Column(length = 500)
    private String memo;
}
