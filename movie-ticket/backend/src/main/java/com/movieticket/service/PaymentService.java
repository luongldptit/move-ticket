package com.movieticket.service;

import com.movieticket.dto.request.PaymentCallbackRequest;
import com.movieticket.dto.request.PaymentInitiateRequest;
import com.movieticket.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse initiatePayment(String email, PaymentInitiateRequest request);
    BookingCallbackResponse handleCallback(PaymentCallbackRequest request);
    PaymentResponse getPaymentByBookingId(Long bookingId, String email);

    record BookingCallbackResponse(String bookingCode, String bookingStatus, String qrCode) {}
}
