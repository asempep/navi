package com.navi.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 경기별 선수 골/도움 기록
 */
@Entity
@Table(name = "match_goal_assist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchGoalAssist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    /** 해당 경기 골 수 */
    private int goals = 0;

    /** 해당 경기 도움 수 */
    private int assists = 0;
}
