package com.navi.repository;

import com.navi.entity.SeasonStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeasonStatsRepository extends JpaRepository<SeasonStats, Long> {

    Optional<SeasonStats> findTopByOrderBySeasonYearDesc();

    Optional<SeasonStats> findBySeasonYear(Integer seasonYear);
}
