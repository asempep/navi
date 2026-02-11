package com.navi.repository;

import com.navi.entity.NextMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NextMatchRepository extends JpaRepository<NextMatch, Long> {

    /** 경기일 오름차순 (가장 가까운 다음 경기가 먼저) */
    List<NextMatch> findAllByOrderByMatchDateAsc();
}
