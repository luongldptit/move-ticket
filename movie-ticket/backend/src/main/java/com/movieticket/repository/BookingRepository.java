package com.movieticket.repository;

import com.movieticket.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status ORDER BY b.createdAt DESC")
    Page<Booking> findByUserIdAndStatus(@Param("userId") Long userId,
                                        @Param("status") Booking.BookingStatus status,
                                        Pageable pageable);

    List<Booking> findByShowtimeIdAndStatusIn(Long showtimeId, List<Booking.BookingStatus> statuses);

    // Find expired PENDING bookings (older than 10 minutes)
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.createdAt < :expiredBefore")
    List<Booking> findExpiredPendingBookings(@Param("expiredBefore") LocalDateTime expiredBefore);

    boolean existsByShowtimeId(Long showtimeId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.showtime.id = :showtimeId AND b.status IN ('PENDING', 'CONFIRMED')")
    long countActiveByShowtimeId(@Param("showtimeId") Long showtimeId);
}
