package com.movieticket.service.impl;

import com.movieticket.dto.request.CinemaRequest;
import com.movieticket.dto.response.CinemaResponse;
import com.movieticket.dto.response.RoomResponse;
import com.movieticket.entity.Cinema;
import com.movieticket.entity.Room;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.CinemaRepository;
import com.movieticket.repository.RoomRepository;
import com.movieticket.service.CinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaServiceImpl implements CinemaService {

    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;

    @Override
    public List<CinemaResponse> getAllCinemas() {
        return cinemaRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public CinemaResponse getCinemaById(Integer id) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy rạp phim với id: " + id));
        CinemaResponse response = mapToResponse(cinema);
        response.setTotalRooms(roomRepository.findByCinemaId(id).size());
        return response;
    }

    @Override
    public List<RoomResponse> getRoomsByCinema(Integer cinemaId) {
        cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy rạp phim với id: " + cinemaId));
        return roomRepository.findByCinemaIdAndIsActiveTrue(cinemaId).stream()
                .map(this::mapRoomToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CinemaResponse createCinema(CinemaRequest request) {
        Cinema cinema = Cinema.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return mapToResponse(cinemaRepository.save(cinema));
    }

    @Override
    @Transactional
    public CinemaResponse updateCinema(Integer id, CinemaRequest request) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy rạp phim với id: " + id));
        if (request.getName() != null) cinema.setName(request.getName());
        if (request.getAddress() != null) cinema.setAddress(request.getAddress());
        if (request.getPhone() != null) cinema.setPhone(request.getPhone());
        if (request.getIsActive() != null) cinema.setActive(request.getIsActive());
        return mapToResponse(cinemaRepository.save(cinema));
    }

    private CinemaResponse mapToResponse(Cinema cinema) {
        return CinemaResponse.builder()
                .id(cinema.getId())
                .name(cinema.getName())
                .address(cinema.getAddress())
                .phone(cinema.getPhone())
                .isActive(cinema.isActive())
                .build();
    }

    private RoomResponse mapRoomToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .type(room.getType().toDisplayName())
                .totalSeats(room.getTotalSeats())
                .isActive(room.isActive())
                .build();
    }
}
