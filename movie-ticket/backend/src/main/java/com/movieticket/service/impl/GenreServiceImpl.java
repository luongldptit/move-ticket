package com.movieticket.service.impl;

import com.movieticket.dto.response.GenreResponse;
import com.movieticket.repository.GenreRepository;
import com.movieticket.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(g -> GenreResponse.builder()
                        .id(g.getId()).name(g.getName()).description(g.getDescription()).build())
                .collect(Collectors.toList());
    }
}
