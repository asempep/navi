package com.navi.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 경기별 출석 여부
 */
@Entity
@Table(name = "match_attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"match_id", "player_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    /** 출석 여부 */
    private boolean attended = true;
}
