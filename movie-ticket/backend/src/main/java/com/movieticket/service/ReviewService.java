package com.movieticket.service;

import com.movieticket.dto.request.ReviewRequest;
import com.movieticket.dto.response.PageResponse;
import com.movieticket.dto.response.ReviewResponse;
import com.movieticket.entity.User;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ReviewService {

    PageResponse<ReviewResponse> getReviewsByMovie(Long movieId, Pageable pageable);

    ReviewResponse createReview(Long movieId, ReviewRequest request, User currentUser);

    ReviewResponse updateReview(Long reviewId, ReviewRequest request, User currentUser);

    void deleteReview(Long reviewId, User currentUser);

    Optional<ReviewResponse> getMyReview(Long movieId, Long userId);

    double getAverageRating(Long movieId);

    long getReviewCount(Long movieId);
}
