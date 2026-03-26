package com.movieticket.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats",
       uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "seat_code"}))
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Seat {

    public enum SeatType { STANDARD, VIP, COUPLE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "row_label", nullable = false, length = 1)
    private String rowLabel;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    @Column(name = "seat_code", nullable = false, length = 10)
    private String seatCode; // e.g. A1, B5

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private SeatType type = SeatType.STANDARD;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
