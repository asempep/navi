package com.navi.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 선수 정보 (이름, 득점/도움/출석은 매 경기 집계로 계산)
 */
@Entity
@Table(name = "player")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    /** 선수 연락처 (선택) */
    @Column(name = "phone_number")
    private String phoneNumber;
}
