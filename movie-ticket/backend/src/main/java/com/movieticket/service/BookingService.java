package com.movieticket.service;

import com.movieticket.dto.request.BookingRequest;
import com.movieticket.dto.response.BookingDetailResponse;
import com.movieticket.dto.response.BookingResponse;
import com.movieticket.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(String email, BookingRequest request);
    PageResponse<BookingResponse> getMyBookings(String email, String status, Pageable pageable);
    BookingDetailResponse getBookingById(Long id, String email);
    void cancelBooking(Long id, String email);
    BookingDetailResponse verifyBookingByCode(String code);
    List<BookingResponse> getBookingsByShowtime(Long showtimeId);
}
