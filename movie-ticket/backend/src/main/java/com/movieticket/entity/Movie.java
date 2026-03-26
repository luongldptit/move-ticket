package com.movieticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "movies")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Movie {

    public enum AgeRating { P, C13, C16, C18 }
    public enum Status { NOW_SHOWING, COMING_SOON, STOPPED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String director;

    @Column(name = "cast_members", columnDefinition = "TEXT")
    private String castMembers;

    @Column(nullable = false)
    private Integer duration; // minutes

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "trailer_url", length = 500)
    private String trailerUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_rating", nullable = false, length = 5)
    private AgeRating ageRating = AgeRating.P;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Status status = Status.COMING_SOON;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "movie_genres",
        joinColumns = @JoinColumn(name = "movie_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
