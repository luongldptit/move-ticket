package com.movieticket.controller;

import com.movieticket.dto.request.MovieRequest;
import com.movieticket.dto.response.*;
import com.movieticket.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> getMovies(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer genreId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("releaseDate").descending());
        return ResponseEntity.ok(ApiResponse.success(movieService.getMovies(status, genreId, keyword, pageable)));
    }

    @GetMapping("/now-showing")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getNowShowing() {
        return ResponseEntity.ok(ApiResponse.success(movieService.getNowShowing()));
    }

    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getComingSoon() {
        return ResponseEntity.ok(ApiResponse.success(movieService.getComingSoon()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDetailResponse>> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(movieService.getMovieById(id)));
    }

    @GetMapping("/{id}/showtimes")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getShowtimes(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Integer cinemaId) {
        return ResponseEntity.ok(ApiResponse.success(movieService.getShowtimesByMovie(id, date, cinemaId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<MovieDetailResponse>> createMovie(@Valid @RequestBody MovieRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phim thành công", movieService.createMovie(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<MovieDetailResponse>> updateMovie(
            @PathVariable Long id, @Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phim thành công", movieService.updateMovie(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phim thành công", null));
    }
}
