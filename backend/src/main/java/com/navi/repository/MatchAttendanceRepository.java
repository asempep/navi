package com.navi.repository;

import com.navi.entity.MatchAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchAttendanceRepository extends JpaRepository<MatchAttendance, Long> {

    List<MatchAttendance> findByMatchId(Long matchId);

    Optional<MatchAttendance> findByMatchIdAndPlayerId(Long matchId, Long playerId);
}
