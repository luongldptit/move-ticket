package com.movieticket.controller;

import com.movieticket.dto.request.RoomRequest;
import com.movieticket.dto.request.SeatBatchRequest;
import com.movieticket.dto.request.SeatUpdateRequest;
import com.movieticket.dto.response.*;
import com.movieticket.service.RoomService;
import com.movieticket.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final SeatService seatService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoomById(id)));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<SeatMapResponse>> getSeatsByRoom(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getSeatsByRoom(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phòng chiếu thành công", roomService.createRoom(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Integer id, @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phòng chiếu thành công", roomService.updateRoom(id, request)));
    }

    @PostMapping("/seats/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createSeatsBatch(@Valid @RequestBody SeatBatchRequest request) {
        int count = seatService.createSeatsBatch(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã tạo " + count + " ghế thành công", String.valueOf(count)));
    }

    @PutMapping("/seats/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SeatResponse>> updateSeat(
            @PathVariable Long id, @Valid @RequestBody SeatUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ghế thành công", seatService.updateSeat(id, request)));
    }
}
