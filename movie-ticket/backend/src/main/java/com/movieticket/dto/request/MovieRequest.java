package com.movieticket.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class MovieRequest {
    @NotBlank(message = "Tên phim không được để trống")
    @Size(max = 255)
    private String title;

    private String description;
    private String director;
    private String castMembers;

    @NotNull(message = "Thời lượng không được để trống")
    @Min(value = 1, message = "Thời lượng phải lớn hơn 0")
    private Integer duration;

    private LocalDate releaseDate;
    private String posterUrl;
    private String trailerUrl;

    private String ageRating = "P";
    private String status = "COMING_SOON";

    private List<Integer> genreIds;
}
