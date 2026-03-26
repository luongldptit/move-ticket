package com.movieticket.repository;

import com.movieticket.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS' " +
           "AND CAST(p.paidAt AS DATE) BETWEEN :from AND :to")
    BigDecimal sumRevenueByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT FORMATDATETIME(p.paidAt, 'yyyy-MM-dd') as period, " +
           "SUM(p.amount) as revenue, COUNT(p) as bookings " +
           "FROM Payment p WHERE p.status = 'SUCCESS' " +
           "AND CAST(p.paidAt AS DATE) BETWEEN :from AND :to " +
           "GROUP BY FORMATDATETIME(p.paidAt, 'yyyy-MM-dd') " +
           "ORDER BY period")
    List<Object[]> getDailyRevenue(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT FORMATDATETIME(p.paidAt, 'yyyy-MM') as period, " +
           "SUM(p.amount) as revenue, COUNT(p) as bookings " +
           "FROM Payment p WHERE p.status = 'SUCCESS' " +
           "AND CAST(p.paidAt AS DATE) BETWEEN :from AND :to " +
           "GROUP BY FORMATDATETIME(p.paidAt, 'yyyy-MM') " +
           "ORDER BY period")
    List<Object[]> getMonthlyRevenue(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
