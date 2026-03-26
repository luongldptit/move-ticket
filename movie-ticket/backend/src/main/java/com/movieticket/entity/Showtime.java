package com.movieticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "showtimes")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Showtime {

    public enum Status { SCHEDULED, ONGOING, FINISHED, CANCELLED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "price_standard", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceStandard;

    @Column(name = "price_vip", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceVip;

    @Column(name = "price_couple", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceCouple;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Status status = Status.SCHEDULED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
