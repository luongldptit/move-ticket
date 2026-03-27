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

    public enum RoomType {
        TYPE_2D, TYPE_3D, IMAX;

        public String toDisplayName() {
            return switch (this) {
                case TYPE_2D -> "2D";
                case TYPE_3D -> "3D";
                case IMAX    -> "IMAX";
            };
        }

        public static RoomType fromDisplayName(String value) {
            if (value == null) return TYPE_2D;
            return switch (value.toUpperCase()) {
                case "2D"     -> TYPE_2D;
                case "3D"     -> TYPE_3D;
                case "IMAX"   -> IMAX;
                case "TYPE_2D"-> TYPE_2D;
                case "TYPE_3D"-> TYPE_3D;
                default -> throw new IllegalArgumentException("Loại phòng không hợp lệ: " + value);
            };
        }
    }

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
