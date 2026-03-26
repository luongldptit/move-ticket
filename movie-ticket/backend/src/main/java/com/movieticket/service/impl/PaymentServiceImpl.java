package com.movieticket.service.impl;

import com.movieticket.dto.request.PaymentCallbackRequest;
import com.movieticket.dto.request.PaymentInitiateRequest;
import com.movieticket.dto.response.PaymentResponse;
import com.movieticket.entity.*;
import com.movieticket.exception.BusinessException;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.*;
import com.movieticket.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PaymentResponse initiatePayment(String email, PaymentInitiateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking"));
        if (!booking.getUser().getEmail().equals(email)) {
            throw new BusinessException("Bạn không có quyền thanh toán booking này");
        }
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BusinessException("Booking không ở trạng thái có thể thanh toán");
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .method(Payment.PaymentMethod.valueOf(request.getMethod()))
                .amount(booking.getFinalAmount())
                .status(Payment.PaymentStatus.PENDING)
                .build();
        payment = paymentRepository.save(payment);

        // Simulate payment URL for non-cash methods
        String paymentUrl = null;
        if (payment.getMethod() != Payment.PaymentMethod.CASH) {
            paymentUrl = "https://payment.example.com/pay?paymentId=" + payment.getId()
                    + "&amount=" + payment.getAmount();
        }
        return mapToResponse(payment, paymentUrl);
    }

    @Override
    @Transactional
    public BookingCallbackResponse handleCallback(PaymentCallbackRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment"));
        Booking booking = payment.getBooking();

        if ("SUCCESS".equalsIgnoreCase(request.getStatus())) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId(request.getTransactionId());
            payment.setPaidAt(LocalDateTime.now());
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }
        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return new BookingCallbackResponse(
                booking.getBookingCode(),
                booking.getStatus().name(),
                booking.getQrCode()
        );
    }

    @Override
    public PaymentResponse getPaymentByBookingId(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking"));
        if (!booking.getUser().getEmail().equals(email)) {
            throw new BusinessException("Bạn không có quyền truy cập thông tin này");
        }
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa có thông tin thanh toán"));
        return mapToResponse(payment, null);
    }

    private PaymentResponse mapToResponse(Payment payment, String paymentUrl) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .bookingCode(payment.getBooking().getBookingCode())
                .method(payment.getMethod().name())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .paymentUrl(paymentUrl)
                .build();
    }
}
