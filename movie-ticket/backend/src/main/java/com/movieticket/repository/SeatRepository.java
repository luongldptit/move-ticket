package com.movieticket.repository;

import com.movieticket.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoomIdOrderByRowLabelAscSeatNumberAsc(Integer roomId);
    List<Seat> findByRoomIdAndIsActiveTrue(Integer roomId);
    boolean existsByRoomIdAndSeatCode(Integer roomId, String seatCode);
    int countByRoomId(Integer roomId);

    @Query("SELECT s FROM Seat s WHERE s.id IN :ids AND s.isActive = true")
    List<Seat> findAllActiveByIdIn(@Param("ids") List<Long> ids);
}
