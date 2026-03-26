package com.movieticket.repository;

import com.movieticket.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    List<BookingSeat> findByBookingId(Long bookingId);

    @Query("SELECT bs.seat.id FROM BookingSeat bs " +
           "WHERE bs.booking.showtime.id = :showtimeId " +
           "AND bs.booking.status IN ('PENDING', 'CONFIRMED')")
    Set<Long> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Long showtimeId);

    boolean existsByBookingIdAndSeatId(Long bookingId, Long seatId);
}
