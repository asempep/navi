package com.navi.repository;

import com.navi.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findAllByOrderByMatchDateDesc();
}
