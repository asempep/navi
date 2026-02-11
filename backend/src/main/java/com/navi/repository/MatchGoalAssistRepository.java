package com.navi.repository;

import com.navi.entity.MatchGoalAssist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MatchGoalAssistRepository extends JpaRepository<MatchGoalAssist, Long> {

    List<MatchGoalAssist> findByMatchIdOrderByGoalsDescAssistsDesc(Long matchId);

    @Query("SELECT mga FROM MatchGoalAssist mga WHERE mga.player.id = :playerId")
    List<MatchGoalAssist> findAllByPlayerId(Long playerId);
}
