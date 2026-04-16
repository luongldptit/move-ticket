package com.movieticket.service.impl;

import com.movieticket.dto.request.ReviewRequest;
import com.movieticket.dto.response.PageResponse;
import com.movieticket.dto.response.ReviewResponse;
import com.movieticket.entity.Booking;
import com.movieticket.entity.Review;
import com.movieticket.entity.User;
import com.movieticket.exception.BusinessException;
import com.movieticket.exception.ConflictException;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.BookingRepository;
import com.movieticket.repository.MovieRepository;
import com.movieticket.repository.ReviewRepository;
import com.movieticket.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviewsByMovie(Long movieId, Pageable pageable) {
        Page<Review> page = reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId, pageable);
        List<ReviewResponse> content = page.getContent().stream()
                .map(ReviewResponse::from)
                .collect(Collectors.toList());
        return PageResponse.<ReviewResponse>builder()
                .content(content)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long movieId, ReviewRequest request, User currentUser) {
        movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phim với id: " + movieId));

        if (reviewRepository.existsByUserIdAndMovieId(currentUser.getId(), movieId)) {
            throw new ConflictException("Bạn đã đánh giá phim này rồi");
        }

        // Removed checking for completed booking to allow reviewing at any status

        try {
            Review review = Review.builder()
                    .user(currentUser)
                    .movie(movieRepository.getReferenceById(movieId))
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .build();
            return ReviewResponse.from(reviewRepository.save(review));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Bạn đã đánh giá phim này rồi");
        }
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, User currentUser) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với id: " + reviewId));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException("Bạn không có quyền chỉnh sửa đánh giá này");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, User currentUser) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với id: " + reviewId));

        boolean isOwner = review.getUser().getId().equals(currentUser.getId());
        boolean isAdminOrStaff = currentUser.getRole() == User.Role.ADMIN
                || currentUser.getRole() == User.Role.STAFF;

        if (!isOwner && !isAdminOrStaff) {
            throw new BusinessException("Bạn không có quyền xóa đánh giá này");
        }

        reviewRepository.delete(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ReviewResponse> getMyReview(Long movieId, Long userId) {
        return reviewRepository.findByUserIdAndMovieId(userId, movieId)
                .map(ReviewResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public double getAverageRating(Long movieId) {
        Double avg = reviewRepository.findAverageRatingByMovieId(movieId);
        if (avg == null) return 0.0;
        return Math.round(avg * 10.0) / 10.0;
    }

    @Override
    @Transactional(readOnly = true)
    public long getReviewCount(Long movieId) {
        return reviewRepository.countByMovieId(movieId);
    }
}
