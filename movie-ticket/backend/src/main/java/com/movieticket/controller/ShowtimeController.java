package com.movieticket.controller;

import com.movieticket.dto.request.ShowtimeRequest;
import com.movieticket.dto.response.*;
import com.movieticket.service.SeatService;
import com.movieticket.service.ShowtimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {

    private final ShowtimeService showtimeService;
    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Integer cinemaId,
            @RequestParam(required = false) Integer roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(
                showtimeService.getShowtimes(movieId, cinemaId, roomId, date, status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getShowtimeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(showtimeService.getShowtimeById(id)));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<SeatMapResponse>> getSeatsByShowtime(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(seatService.getSeatStatusByShowtime(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo suất chiếu thành công", showtimeService.createShowtime(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> updateShowtime(
            @PathVariable Long id, @Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật suất chiếu thành công", showtimeService.updateShowtime(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa suất chiếu thành công", null));
    }
}
