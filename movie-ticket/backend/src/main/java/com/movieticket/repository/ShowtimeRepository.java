package com.movieticket.repository;

import com.movieticket.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovieIdOrderByStartTimeAsc(Long movieId);

    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId AND DATE(s.startTime) = :date ORDER BY s.startTime")
    List<Showtime> findByMovieIdAndDate(@Param("movieId") Long movieId,
                                        @Param("date") java.time.LocalDate date);

    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId AND s.room.cinema.id = :cinemaId AND DATE(s.startTime) = :date ORDER BY s.startTime")
    List<Showtime> findByMovieIdAndCinemaIdAndDate(@Param("movieId") Long movieId,
                                                   @Param("cinemaId") Integer cinemaId,
                                                   @Param("date") java.time.LocalDate date);

    @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.room.id = :roomId " +
           "AND s.id <> :excludeId " +
           "AND s.status <> 'CANCELLED' " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    boolean hasConflict(@Param("roomId") Integer roomId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("excludeId") Long excludeId);

    @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.room.id = :roomId " +
           "AND s.status <> 'CANCELLED' " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    boolean hasConflictForNew(@Param("roomId") Integer roomId,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime);

    @Query("SELECT s FROM Showtime s WHERE " +
           "(:movieId IS NULL OR s.movie.id = :movieId) AND " +
           "(:cinemaId IS NULL OR s.room.cinema.id = :cinemaId) AND " +
           "(:roomId IS NULL OR s.room.id = :roomId) AND " +
           "(:status IS NULL OR s.status = :status) " +
           "ORDER BY s.startTime")
    List<Showtime> findWithFilters(@Param("movieId") Long movieId,
                                   @Param("cinemaId") Integer cinemaId,
                                   @Param("roomId") Integer roomId,
                                   @Param("status") Showtime.Status status);

    boolean existsByMovieIdAndRoomId(Long movieId, Integer roomId);

    @Query("SELECT s FROM Showtime s WHERE s.status <> 'CANCELLED' " +
           "AND CAST(s.startTime AS DATE) BETWEEN :from AND :to " +
           "AND (:cinemaId IS NULL OR s.room.cinema.id = :cinemaId)")
    List<Showtime> findByDateRangeAndCinema(@Param("from") java.time.LocalDate from,
                                            @Param("to") java.time.LocalDate to,
                                            @Param("cinemaId") Integer cinemaId);
}
