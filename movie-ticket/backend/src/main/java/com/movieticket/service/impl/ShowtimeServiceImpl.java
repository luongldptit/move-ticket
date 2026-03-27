package com.movieticket.service.impl;

import com.movieticket.dto.request.ShowtimeRequest;
import com.movieticket.dto.response.*;
import com.movieticket.entity.*;
import com.movieticket.exception.BusinessException;
import com.movieticket.exception.ConflictException;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.*;
import com.movieticket.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimes(Long movieId, Integer cinemaId, Integer roomId, LocalDate date, String status) {
        Showtime.Status statusEnum = status != null ? Showtime.Status.valueOf(status) : null;
        return showtimeRepository.findWithFilters(movieId, cinemaId, roomId, statusEnum)
                .stream()
                .filter(st -> date == null || st.getStartTime().toLocalDate().equals(date))
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy suất chiếu với id: " + id));
        return mapToResponse(showtime);
    }

    @Override
    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phim: " + request.getMovieId()));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng chiếu: " + request.getRoomId()));
        // Calculate end time
        var endTime = request.getStartTime().plusMinutes(movie.getDuration());
        // Check conflict
        if (showtimeRepository.hasConflictForNew(request.getRoomId(), request.getStartTime(), endTime)) {
            throw new ConflictException("Phòng chiếu đã có suất chiếu khác trong khung giờ này");
        }
        Showtime showtime = Showtime.builder()
                .movie(movie)
                .room(room)
                .startTime(request.getStartTime())
                .endTime(endTime)
                .priceStandard(request.getPriceStandard())
                .priceVip(request.getPriceVip())
                .priceCouple(request.getPriceCouple())
                .status(Showtime.Status.SCHEDULED)
                .build();
        return mapToResponse(showtimeRepository.save(showtime));
    }

    @Override
    @Transactional
    public ShowtimeResponse updateShowtime(Long id, ShowtimeRequest request) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy suất chiếu với id: " + id));
        if (request.getPriceStandard() != null) showtime.setPriceStandard(request.getPriceStandard());
        if (request.getPriceVip() != null) showtime.setPriceVip(request.getPriceVip());
        if (request.getPriceCouple() != null) showtime.setPriceCouple(request.getPriceCouple());
        if (request.getStatus() != null) showtime.setStatus(Showtime.Status.valueOf(request.getStatus()));
        return mapToResponse(showtimeRepository.save(showtime));
    }

    @Override
    @Transactional
    public void deleteShowtime(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy suất chiếu với id: " + id));
        if (bookingRepository.existsByShowtimeId(id)) {
            throw new ConflictException("Không thể xóa suất chiếu đã có vé được đặt");
        }
        showtimeRepository.delete(showtime);
    }

    private ShowtimeResponse mapToResponse(Showtime st) {
        Room room = st.getRoom();
        Cinema cinema = room.getCinema();
        int bookedSeats = (int) bookingRepository.countActiveByShowtimeId(st.getId());
        int totalSeats = room.getTotalSeats();

        // Tự động tính trạng thái dựa theo thời gian thực
        LocalDateTime now = LocalDateTime.now();
        String effectiveStatus;
        if (st.getStatus() == Showtime.Status.CANCELLED) {
            effectiveStatus = "CANCELLED";
        } else if (st.getEndTime().isBefore(now)) {
            effectiveStatus = "FINISHED";
        } else if (st.getStartTime().isBefore(now)) {
            effectiveStatus = "ONGOING";
        } else {
            effectiveStatus = "SCHEDULED";
        }

        return ShowtimeResponse.builder()
                .id(st.getId())
                .movie(MovieResponse.builder()
                        .id(st.getMovie().getId()).title(st.getMovie().getTitle())
                        .duration(st.getMovie().getDuration()).build())
                .room(RoomResponse.builder()
                        .id(room.getId()).name(room.getName()).type(room.getType().toDisplayName())
                        .totalSeats(totalSeats).build())
                .cinema(CinemaResponse.builder()
                        .id(cinema.getId()).name(cinema.getName()).address(cinema.getAddress()).build())
                .startTime(st.getStartTime())
                .endTime(st.getEndTime())
                .priceStandard(st.getPriceStandard())
                .priceVip(st.getPriceVip())
                .priceCouple(st.getPriceCouple())
                .status(effectiveStatus)
                .availableSeats(totalSeats - bookedSeats)
                .totalSeats(totalSeats)
                .build();
    }
}
