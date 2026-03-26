package com.movieticket.service;

import com.movieticket.dto.response.GenreResponse;
import java.util.List;

public interface GenreService {
    List<GenreResponse> getAllGenres();
}
