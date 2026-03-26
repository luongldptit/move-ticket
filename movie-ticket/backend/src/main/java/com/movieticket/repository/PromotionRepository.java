package com.movieticket.repository;

import com.movieticket.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    Optional<Promotion> findByCode(String code);
    Optional<Promotion> findByCodeAndIsActiveTrue(String code);
    boolean existsByCode(String code);

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true " +
           "AND p.startDate <= :today AND p.endDate >= :today " +
           "AND p.code = :code")
    Optional<Promotion> findValidByCode(@Param("code") String code, @Param("today") LocalDate today);

    Page<Promotion> findAll(Pageable pageable);

    @Query("SELECT p FROM Promotion p WHERE (:isActive IS NULL OR p.isActive = :isActive)")
    Page<Promotion> findAllByIsActive(@Param("isActive") Boolean isActive, Pageable pageable);
}
