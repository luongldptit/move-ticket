package com.movieticket.service;

import com.movieticket.dto.request.SeatBatchRequest;
import com.movieticket.dto.request.SeatUpdateRequest;
import com.movieticket.dto.response.SeatMapResponse;
import com.movieticket.dto.response.SeatResponse;

public interface SeatService {
    int createSeatsBatch(SeatBatchRequest request);
    SeatResponse updateSeat(Long id, SeatUpdateRequest request);
    SeatMapResponse getSeatStatusByShowtime(Long showtimeId);
}
