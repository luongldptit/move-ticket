package com.movieticket.service;

import com.movieticket.entity.Booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface EmailService {

    void sendBookingSuccessEmail(String toEmail, String customerName, String movieTitle, LocalDateTime startTime, String seatCodes, BigDecimal amount);
}
