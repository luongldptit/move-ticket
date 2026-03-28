package com.movieticket.service.impl;

import com.movieticket.dto.request.BookingRequest;
import com.movieticket.dto.response.*;
import com.movieticket.entity.*;
import com.movieticket.exception.BusinessException;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.*;
import com.movieticket.service.BookingService;
import com.movieticket.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final PromotionRepository promotionRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public BookingResponse createBooking(String email, BookingRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu không tồn tại"));

        if (showtime.getStatus() != Showtime.Status.SCHEDULED) {
            throw new BusinessException("Suất chiếu không còn sẵn để đặt vé");
        }
        if (!showtime.getStartTime().isAfter(java.time.LocalDateTime.now())) {
            throw new BusinessException("Suất chiếu này đã bắt đầu hoặc kết thúc, không thể đặt vé");
        }

        // Validate seats
        Set<Long> alreadyBooked = bookingSeatRepository.findBookedSeatIdsByShowtimeId(showtime.getId());
        List<Long> requestedSeats = request.getSeatIds();
        for (Long seatId : requestedSeats) {
            if (alreadyBooked.contains(seatId)) {
                throw new BusinessException("Một hoặc nhiều ghế đã được đặt, vui lòng chọn lại");
            }
        }

        List<Seat> seats = seatRepository.findAllById(requestedSeats);
        if (seats.size() != requestedSeats.size()) {
            throw new BusinessException("Một số ghế không hợp lệ");
        }

        // Calculate total amount
        BigDecimal totalAmount = seats.stream().map(seat -> switch (seat.getType()) {
            case VIP -> showtime.getPriceVip();
            case COUPLE -> showtime.getPriceCouple();
            default -> showtime.getPriceStandard();
        }).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply promotion
        BigDecimal discountAmount = BigDecimal.ZERO;
        Promotion promotion = null;
        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            Optional<Promotion> promo = promotionRepository.findByCodeAndIsActiveTrue(request.getPromotionCode());
            if (promo.isPresent()) {
                promotion = promo.get();
                discountAmount = calculateDiscount(promotion, totalAmount);
            }
        }
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        // Generate booking code
        String bookingCode = "MT" + System.currentTimeMillis();

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .showtime(showtime)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .promotion(promotion)
                .status(Booking.BookingStatus.PENDING)
                .build();
        booking = bookingRepository.save(booking);

        List<BookingSeat> bookingSeats = new ArrayList<>();
        for (Seat seat : seats) {
            BigDecimal price = switch (seat.getType()) {
                case VIP -> showtime.getPriceVip();
                case COUPLE -> showtime.getPriceCouple();
                default -> showtime.getPriceStandard();
            };
            bookingSeats.add(BookingSeat.builder()
                    .booking(booking).seat(seat).price(price).build());
        }
        bookingSeatRepository.saveAll(bookingSeats);
        //send mail
        sendBookingEmail(user, showtime, seats, finalAmount);
        return buildBookingResponse(booking, seats, showtime);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMyBookings(String email, String status, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        Page<Booking> page;
        if (status != null) {
            page = bookingRepository.findByUserIdAndStatus(user.getId(),
                    Booking.BookingStatus.valueOf(status), pageable);
        } else {
            page = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        }
        List<BookingResponse> content = page.getContent().stream()
                .map(b -> buildBookingResponse(b,
                        bookingSeatRepository.findByBookingId(b.getId())
                                .stream().map(BookingSeat::getSeat).collect(Collectors.toList()),
                        b.getShowtime()))
                .collect(Collectors.toList());
        return PageResponse.<BookingResponse>builder()
                .content(content).totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages()).currentPage(page.getNumber()).pageSize(page.getSize()).build();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingById(Long id, String email) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking"));
        if (email != null && !booking.getUser().getEmail().equals(email)) {
            throw new BusinessException("Bạn không có quyền truy cập booking này");
        }
        return buildDetailResponse(booking);
    }

    @Override
    @Transactional
    public void cancelBooking(Long id, String email) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking"));
        if (!booking.getUser().getEmail().equals(email)) {
            throw new BusinessException("Bạn không có quyền hủy booking này");
        }
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BusinessException("Không thể hủy booking ở trạng thái này");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse verifyBookingByCode(String code) {
        Booking booking = bookingRepository.findByBookingCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã đặt vé không tồn tại"));
        return buildDetailResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByShowtime(Long showtimeId) {
        return bookingRepository.findByShowtimeIdAndStatusIn(showtimeId,
                        List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.CONFIRMED)).stream()
                .map(b -> buildBookingResponse(b,
                        bookingSeatRepository.findByBookingId(b.getId())
                                .stream().map(BookingSeat::getSeat).collect(Collectors.toList()),
                        b.getShowtime()))
                .collect(Collectors.toList());
    }

    private BigDecimal calculateDiscount(Promotion promotion, BigDecimal totalAmount) {
        if (promotion.getMinOrderAmount() != null &&
                totalAmount.compareTo(promotion.getMinOrderAmount()) < 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal discount;
        if (promotion.getDiscountType() == Promotion.DiscountType.PERCENTAGE) {
            discount = totalAmount.multiply(promotion.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (promotion.getMaxDiscountAmount() != null &&
                    discount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                discount = promotion.getMaxDiscountAmount();
            }
        } else {
            discount = promotion.getDiscountValue();
        }
        return discount.min(totalAmount);
    }

    private BookingResponse buildBookingResponse(Booking booking, List<Seat> seats, Showtime showtime) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .movieTitle(showtime.getMovie().getTitle())
                .posterUrl(showtime.getMovie().getPosterUrl())
                .startTime(showtime.getStartTime())
                .cinemaName(showtime.getRoom().getCinema().getName())
                .roomName(showtime.getRoom().getName())
                .seatCodes(seats.stream().map(Seat::getSeatCode).sorted().collect(Collectors.toList()))
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountAmount())
                .finalAmount(booking.getFinalAmount())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .promotionApplied(booking.getPromotion() != null ? booking.getPromotion().getCode() : null)
                .build();
    }

    private BookingDetailResponse buildDetailResponse(Booking booking) {
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(booking.getId());
        Showtime st = booking.getShowtime();
        User user = booking.getUser();

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId()).email(user.getEmail()).fullName(user.getFullName()).build();

        List<BookingDetailResponse.SeatInfo> seatInfos = bookingSeats.stream()
                .map(bs -> BookingDetailResponse.SeatInfo.builder()
                        .seatCode(bs.getSeat().getSeatCode())
                        .type(bs.getSeat().getType().name())
                        .price(bs.getPrice()).build())
                .collect(Collectors.toList());

        BookingDetailResponse.ShowtimeInfo showtimeInfo = BookingDetailResponse.ShowtimeInfo.builder()
                .id(st.getId())
                .movieTitle(st.getMovie().getTitle())
                .startTime(st.getStartTime())
                .roomName(st.getRoom().getName())
                .cinemaName(st.getRoom().getCinema().getName())
                .build();

        BookingDetailResponse.PaymentInfo paymentInfo = null;
        Payment payment = booking.getPayment();
        if (payment != null) {
            paymentInfo = BookingDetailResponse.PaymentInfo.builder()
                    .method(payment.getMethod().name())
                    .status(payment.getStatus().name())
                    .paidAt(payment.getPaidAt())
                    .build();
        }

        return BookingDetailResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .qrCode(booking.getQrCode())
                .user(userResponse)
                .showtime(showtimeInfo)
                .seats(seatInfos)
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountAmount())
                .finalAmount(booking.getFinalAmount())
                .status(booking.getStatus().name())
                .payment(paymentInfo)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private void sendBookingEmail(User user, Showtime showtime, List<Seat> seats, BigDecimal finalAmount) {
        log.info("sendBookingEmail start  user:{}, showtime:{}, seats:{}, finalAmount:{}", user, showtime, seats, finalAmount);
        String movieTitle = showtime.getMovie().getTitle();

        String seatCodes = seats.stream()
                .map(Seat::getSeatCode)
                .collect(Collectors.joining(", "));

        emailService.sendBookingSuccessEmail(
//                "ltung7436@gmail.com",
                user.getEmail(), //hard code tạm thời
                user.getFullName(),
                movieTitle,
                showtime.getStartTime(),
                seatCodes,
                finalAmount
        );
        log.info("sendBookingEmail end email");
    }
}
