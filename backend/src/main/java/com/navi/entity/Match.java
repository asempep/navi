package com.navi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 경기 정보
 */
@Entity
@Table(name = "game")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 경기일 */
    @Column(nullable = false)
    private LocalDate matchDate;

    /** 경기 시간 (선택) */
    private LocalTime matchTime;

    /** 상대팀 */
    private String opponent;

    /** 우리 팀 득점 */
    private int ourScore;

    /** 상대팀 득점 */
    private int opponentScore;

    /** 경기 결과: 승, 무, 패 */
    @Column(length = 10)
    private String result;
}
