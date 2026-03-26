package com.movieticket.service;

import com.movieticket.dto.request.MovieRequest;
import com.movieticket.dto.response.MovieDetailResponse;
import com.movieticket.dto.response.MovieResponse;
import com.movieticket.dto.response.PageResponse;
import com.movieticket.dto.response.ShowtimeResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface MovieService {
    PageResponse<MovieResponse> getMovies(String status, Integer genreId, String keyword, Pageable pageable);
    List<MovieResponse> getNowShowing();
    List<MovieResponse> getComingSoon();
    MovieDetailResponse getMovieById(Long id);
    List<ShowtimeResponse> getShowtimesByMovie(Long movieId, LocalDate date, Integer cinemaId);
    MovieDetailResponse createMovie(MovieRequest request);
    MovieDetailResponse updateMovie(Long id, MovieRequest request);
    void deleteMovie(Long id);
}
