package com.movieticket.service;

import com.movieticket.dto.request.RoomRequest;
import com.movieticket.dto.response.RoomResponse;
import com.movieticket.dto.response.SeatMapResponse;

import java.util.List;

public interface RoomService {
    List<RoomResponse> getAllRooms(Integer cinemaId);
    RoomResponse getRoomById(Integer id);
    RoomResponse createRoom(RoomRequest request);
    RoomResponse updateRoom(Integer id, RoomRequest request);
    SeatMapResponse getSeatsByRoom(Integer roomId);
}
