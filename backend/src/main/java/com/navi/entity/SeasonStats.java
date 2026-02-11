package com.navi.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 시즌 전체 전적 (승/무/패)
 */
@Entity
@Table(name = "season_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeasonStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 시즌 연도 (예: 2026) */
    @Column(nullable = false)
    private Integer seasonYear;

    /** 총 경기 수 */
    private int totalMatches = 0;

    /** 승 */
    private int wins = 0;

    /** 무 */
    private int draws = 0;

    /** 패 */
    private int losses = 0;
}
