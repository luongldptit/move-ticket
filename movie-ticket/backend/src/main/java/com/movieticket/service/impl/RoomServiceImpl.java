package com.movieticket.service.impl;

import com.movieticket.dto.request.RoomRequest;
import com.movieticket.dto.response.*;
import com.movieticket.entity.*;
import com.movieticket.exception.ConflictException;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.*;
import com.movieticket.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final CinemaRepository cinemaRepository;
    private final SeatRepository seatRepository;

    @Override
    public RoomResponse getRoomById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng chiếu với id: " + id));
        Cinema cinema = room.getCinema();
        CinemaResponse cinemaResponse = CinemaResponse.builder()
                .id(cinema.getId()).name(cinema.getName()).build();
        return RoomResponse.builder()
                .id(room.getId()).name(room.getName()).type(room.getType().name())
                .totalSeats(room.getTotalSeats()).isActive(room.isActive())
                .cinema(cinemaResponse).build();
    }

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy rạp phim với id: " + request.getCinemaId()));
        if (roomRepository.existsByCinemaIdAndName(request.getCinemaId(), request.getName())) {
            throw new ConflictException("Phòng '" + request.getName() + "' đã tồn tại trong rạp này");
        }
        Room room = Room.builder()
                .cinema(cinema)
                .name(request.getName())
                .type(Room.RoomType.valueOf(request.getType()))
                .totalSeats(request.getTotalSeats() != null ? request.getTotalSeats() : 0)
                .isActive(true)
                .build();
        room = roomRepository.save(room);
        return RoomResponse.builder()
                .id(room.getId()).name(room.getName()).type(room.getType().name())
                .totalSeats(room.getTotalSeats()).isActive(true).build();
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Integer id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng chiếu với id: " + id));
        if (request.getName() != null) room.setName(request.getName());
        if (request.getType() != null) room.setType(Room.RoomType.valueOf(request.getType()));
        if (request.getIsActive() != null) room.setActive(request.getIsActive());
        return RoomResponse.builder()
                .id(room.getId()).name(room.getName()).type(room.getType().name())
                .totalSeats(room.getTotalSeats()).isActive(room.isActive()).build();
    }

    @Override
    public SeatMapResponse getSeatsByRoom(Integer roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng chiếu với id: " + roomId));
        List<Seat> seats = seatRepository.findByRoomIdOrderByRowLabelAscSeatNumberAsc(roomId);
        return buildSeatMap(room.getId(), room.getName(), seats, null, null, null);
    }

    public static SeatMapResponse buildSeatMap(Integer roomId, String roomName,
                                               List<Seat> seats, Set<Long> bookedIds,
                                               Set<Long> heldIds,
                                               Map<Long, java.math.BigDecimal> priceMap) {
        Map<String, List<SeatResponse>> grouped = new LinkedHashMap<>();
        for (Seat seat : seats) {
            String row = String.valueOf(seat.getRowLabel());
            SeatResponse.SeatResponseBuilder builder = SeatResponse.builder()
                    .id(seat.getId()).seatCode(seat.getSeatCode())
                    .type(seat.getType().name()).isActive(seat.isActive());
            if (bookedIds != null) {
                String status;
                if (bookedIds.contains(seat.getId())) status = "BOOKED";
                else if (heldIds != null && heldIds.contains(seat.getId())) status = "HELD";
                else status = "AVAILABLE";
                builder.seatStatus(status);
            }
            if (priceMap != null) builder.price(priceMap.get(seat.getId()));
            grouped.computeIfAbsent(row, k -> new ArrayList<>()).add(builder.build());
        }
        List<SeatMapResponse.SeatRowResponse> rows = grouped.entrySet().stream()
                .map(e -> SeatMapResponse.SeatRowResponse.builder()
                        .rowLabel(e.getKey()).seats(e.getValue()).build())
                .collect(Collectors.toList());
        return SeatMapResponse.builder().roomId(roomId).roomName(roomName).rows(rows).build();
    }
}
