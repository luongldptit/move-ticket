package com.movieticket.repository;

import com.movieticket.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    Page<Movie> findByStatus(Movie.Status status, Pageable pageable);

    @Query("""
        SELECT m FROM Movie m
        WHERE (:status IS NULL OR m.status = :status)
          AND (:keyword IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:genreId IS NULL OR EXISTS (
              SELECT g FROM m.genres g WHERE g.id = :genreId
          ))
    """)
    Page<Movie> findWithFilters(
        @Param("status") Movie.Status status,
        @Param("keyword") String keyword,
        @Param("genreId") Integer genreId,
        Pageable pageable
    );
}
