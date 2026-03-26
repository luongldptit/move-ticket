package com.movieticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "rooms",
       uniqueConstraints = @UniqueConstraint(columnNames = {"cinema_id", "name"}))
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Room {

    public enum RoomType { TYPE_2D, TYPE_3D, IMAX }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private RoomType type = RoomType.TYPE_2D;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats = 0;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Seat> seats;
}
