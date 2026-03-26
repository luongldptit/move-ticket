package com.movieticket.controller;

import com.movieticket.dto.request.CinemaRequest;
import com.movieticket.dto.response.*;
import com.movieticket.service.CinemaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cinemas")
@RequiredArgsConstructor
public class CinemaController {

    private final CinemaService cinemaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CinemaResponse>>> getAllCinemas() {
        return ResponseEntity.ok(ApiResponse.success(cinemaService.getAllCinemas()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> getCinemaById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(cinemaService.getCinemaById(id)));
    }

    @GetMapping("/{id}/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getRoomsByCinema(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(cinemaService.getRoomsByCinema(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CinemaResponse>> createCinema(@Valid @RequestBody CinemaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo rạp thành công", cinemaService.createCinema(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CinemaResponse>> updateCinema(
            @PathVariable Integer id, @Valid @RequestBody CinemaRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật rạp thành công", cinemaService.updateCinema(id, request)));
    }
}
