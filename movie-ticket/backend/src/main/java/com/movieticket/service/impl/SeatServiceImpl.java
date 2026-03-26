package com.movieticket.service.impl;

import com.movieticket.dto.request.SeatBatchRequest;
import com.movieticket.dto.request.SeatUpdateRequest;
import com.movieticket.dto.response.SeatMapResponse;
import com.movieticket.dto.response.SeatResponse;
import com.movieticket.entity.*;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.*;
import com.movieticket.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeRepository showtimeRepository;
    private final BookingSeatRepository bookingSeatRepository;

    @Override
    @Transactional
    public int createSeatsBatch(SeatBatchRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng chiếu: " + request.getRoomId()));
        List<Seat> seats = new ArrayList<>();
        for (SeatBatchRequest.SeatRowConfig rowConfig : request.getRows()) {
            for (int i = 1; i <= rowConfig.getSeatCount(); i++) {
                String seatCode = rowConfig.getRowLabel() + i;
                if (!seatRepository.existsByRoomIdAndSeatCode(request.getRoomId(), seatCode)) {
                    Seat seat = Seat.builder()
                            .room(room)
                            .rowLabel(rowConfig.getRowLabel().charAt(0))
                            .seatNumber(i)
                            .seatCode(seatCode)
                            .type(Seat.SeatType.valueOf(rowConfig.getType()))
                            .isActive(true)
                            .build();
                    seats.add(seat);
                }
            }
        }
        seatRepository.saveAll(seats);
        int total = seatRepository.countByRoomId(request.getRoomId());
        room.setTotalSeats(total);
        roomRepository.save(room);
        return seats.size();
    }

    @Override
    @Transactional
    public SeatResponse updateSeat(Long id, SeatUpdateRequest request) {
        Seat seat = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ghế với id: " + id));
        if (request.getType() != null) seat.setType(Seat.SeatType.valueOf(request.getType()));
        if (request.getIsActive() != null) seat.setActive(request.getIsActive());
        seatRepository.save(seat);
        return SeatResponse.builder()
                .id(seat.getId()).seatCode(seat.getSeatCode())
                .type(seat.getType().name()).isActive(seat.isActive()).build();
    }

    @Override
    public SeatMapResponse getSeatStatusByShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy suất chiếu: " + showtimeId));
        Room room = showtime.getRoom();
        List<Seat> seats = seatRepository.findByRoomIdOrderByRowLabelAscSeatNumberAsc(room.getId());

        Set<Long> bookedIds = bookingSeatRepository.findBookedSeatIdsByShowtimeId(showtimeId);
        // For price map: use showtime pricing by seat type
        Map<Long, BigDecimal> priceMap = new HashMap<>();
        for (Seat seat : seats) {
            BigDecimal price = switch (seat.getType()) {
                case VIP -> showtime.getPriceVip();
                case COUPLE -> showtime.getPriceCouple();
                default -> showtime.getPriceStandard();
            };
            priceMap.put(seat.getId(), price);
        }

        SeatMapResponse seatMap = RoomServiceImpl.buildSeatMap(
                room.getId(), room.getName(), seats, bookedIds, null, priceMap);
        // Wrap with showtime id
        return SeatMapResponse.builder()
                .roomId(room.getId())
                .roomName(room.getName())
                .rows(seatMap.getRows())
                .build();
    }
}
