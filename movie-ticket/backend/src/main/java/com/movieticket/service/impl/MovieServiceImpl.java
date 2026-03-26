package com.movieticket.service.impl;

import com.movieticket.dto.request.MovieRequest;
import com.movieticket.dto.response.*;
import com.movieticket.entity.*;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.*;
import com.movieticket.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final ShowtimeRepository showtimeRepository;
    private final BookingSeatRepository bookingSeatRepository;

    @Override
    public PageResponse<MovieResponse> getMovies(String status, Integer genreId, String keyword, Pageable pageable) {
        Page<Movie> moviePage;
        if (keyword != null && !keyword.isBlank()) {
            moviePage = movieRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(keyword, pageable);
        } else if (status != null && genreId != null) {
            moviePage = movieRepository.findByStatusAndGenreId(
                    Movie.MovieStatus.valueOf(status), genreId, pageable);
        } else if (status != null) {
            moviePage = movieRepository.findByStatusOrderByReleaseDateDesc(
                    Movie.MovieStatus.valueOf(status), pageable);
        } else if (genreId != null) {
            moviePage = movieRepository.findByGenreId(genreId, pageable);
        } else {
            moviePage = movieRepository.findAll(pageable);
        }
        List<MovieResponse> content = moviePage.getContent().stream()
                .map(this::mapToMovieResponse).collect(Collectors.toList());
        return PageResponse.<MovieResponse>builder()
                .content(content)
                .totalElements(moviePage.getTotalElements())
                .totalPages(moviePage.getTotalPages())
                .currentPage(moviePage.getNumber())
                .pageSize(moviePage.getSize())
                .build();
    }

    @Override
    public List<MovieResponse> getNowShowing() {
        return movieRepository.findByStatus(Movie.MovieStatus.NOW_SHOWING).stream()
                .map(this::mapToMovieResponse).collect(Collectors.toList());
    }

    @Override
    public List<MovieResponse> getComingSoon() {
        return movieRepository.findByStatus(Movie.MovieStatus.COMING_SOON).stream()
                .map(this::mapToMovieResponse).collect(Collectors.toList());
    }

    @Override
    public MovieDetailResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phim với id: " + id));
        return mapToMovieDetailResponse(movie);
    }

    @Override
    public List<ShowtimeResponse> getShowtimesByMovie(Long movieId, LocalDate date, Integer cinemaId) {
        movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phim với id: " + movieId));
        List<Showtime> showtimes;
        if (date != null && cinemaId != null) {
            showtimes = showtimeRepository.findByMovieIdAndCinemaIdAndDate(movieId, cinemaId, date);
        } else if (date != null) {
            showtimes = showtimeRepository.findByMovieIdAndDate(movieId, date);
        } else {
            showtimes = showtimeRepository.findByMovieIdOrderByStartTimeAsc(movieId);
        }
        return showtimes.stream().map(this::mapToShowtimeResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MovieDetailResponse createMovie(MovieRequest request) {
        Movie movie = new Movie();
        applyMovieRequest(movie, request);
        movie = movieRepository.save(movie);
        return mapToMovieDetailResponse(movie);
    }

    @Override
    @Transactional
    public MovieDetailResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phim với id: " + id));
        applyMovieRequest(movie, request);
        movie = movieRepository.save(movie);
        return mapToMovieDetailResponse(movie);
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phim với id: " + id));
        movie.setStatus(Movie.MovieStatus.STOPPED);
        movieRepository.save(movie);
    }

    private void applyMovieRequest(Movie movie, MovieRequest request) {
        if (request.getTitle() != null) movie.setTitle(request.getTitle());
        if (request.getDescription() != null) movie.setDescription(request.getDescription());
        if (request.getDirector() != null) movie.setDirector(request.getDirector());
        if (request.getCastMembers() != null) movie.setCastMembers(request.getCastMembers());
        if (request.getDuration() != null) movie.setDuration(request.getDuration());
        if (request.getReleaseDate() != null) movie.setReleaseDate(request.getReleaseDate());
        if (request.getPosterUrl() != null) movie.setPosterUrl(request.getPosterUrl());
        if (request.getTrailerUrl() != null) movie.setTrailerUrl(request.getTrailerUrl());
        if (request.getAgeRating() != null) movie.setAgeRating(Movie.AgeRating.valueOf(request.getAgeRating()));
        if (request.getStatus() != null) movie.setStatus(Movie.MovieStatus.valueOf(request.getStatus()));

        if (request.getGenreIds() != null) {
            List<Genre> genres = genreRepository.findAllById(request.getGenreIds());
            movie.setGenres(genres);
        }
    }

    private MovieResponse mapToMovieResponse(Movie movie) {
        List<String> genreNames = movie.getGenres() == null ? List.of() :
                movie.getGenres().stream().map(Genre::getName).collect(Collectors.toList());
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .duration(movie.getDuration())
                .releaseDate(movie.getReleaseDate())
                .posterUrl(movie.getPosterUrl())
                .ageRating(movie.getAgeRating() != null ? movie.getAgeRating().name() : "P")
                .status(movie.getStatus().name())
                .genres(genreNames)
                .build();
    }

    private MovieDetailResponse mapToMovieDetailResponse(Movie movie) {
        List<GenreResponse> genres = movie.getGenres() == null ? List.of() :
                movie.getGenres().stream().map(g -> GenreResponse.builder()
                        .id(g.getId()).name(g.getName()).description(g.getDescription()).build())
                        .collect(Collectors.toList());
        return MovieDetailResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .director(movie.getDirector())
                .castMembers(movie.getCastMembers())
                .duration(movie.getDuration())
                .releaseDate(movie.getReleaseDate())
                .posterUrl(movie.getPosterUrl())
                .trailerUrl(movie.getTrailerUrl())
                .ageRating(movie.getAgeRating() != null ? movie.getAgeRating().name() : "P")
                .status(movie.getStatus().name())
                .genres(genres)
                .build();
    }

    private ShowtimeResponse mapToShowtimeResponse(Showtime st) {
        Room room = st.getRoom();
        Cinema cinema = room.getCinema();
        CinemaResponse cinemaResponse = CinemaResponse.builder()
                .id(cinema.getId()).name(cinema.getName()).address(cinema.getAddress()).build();
        RoomResponse roomResponse = RoomResponse.builder()
                .id(room.getId()).name(room.getName()).type(room.getType().name())
                .totalSeats(room.getTotalSeats()).build();
        return ShowtimeResponse.builder()
                .id(st.getId())
                .movie(mapToMovieResponse(st.getMovie()))
                .room(roomResponse)
                .cinema(cinemaResponse)
                .startTime(st.getStartTime())
                .endTime(st.getEndTime())
                .priceStandard(st.getPriceStandard())
                .priceVip(st.getPriceVip())
                .priceCouple(st.getPriceCouple())
                .status(st.getStatus().name())
                .build();
    }
}
