package com.movieticket.controller;

import com.movieticket.dto.response.ApiResponse;
import com.movieticket.dto.response.GenreResponse;
import com.movieticket.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getAllGenres() {
        return ResponseEntity.ok(ApiResponse.success(genreService.getAllGenres()));
    }
}
