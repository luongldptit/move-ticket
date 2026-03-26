package com.movieticket.service;

import com.movieticket.dto.request.CinemaRequest;
import com.movieticket.dto.response.CinemaResponse;
import com.movieticket.dto.response.RoomResponse;

import java.util.List;

public interface CinemaService {
    List<CinemaResponse> getAllCinemas();
    CinemaResponse getCinemaById(Integer id);
    List<RoomResponse> getRoomsByCinema(Integer cinemaId);
    CinemaResponse createCinema(CinemaRequest request);
    CinemaResponse updateCinema(Integer id, CinemaRequest request);
}
