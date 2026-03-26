package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class MovieDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String director;
    private String castMembers;
    private Integer duration;
    private LocalDate releaseDate;
    private String posterUrl;
    private String trailerUrl;
    private String ageRating;
    private String status;
    private List<GenreResponse> genres;
}
