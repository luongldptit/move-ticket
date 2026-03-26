package com.movieticket.repository;

import com.movieticket.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    List<Room> findByCinemaIdAndIsActiveTrue(Integer cinemaId);
    List<Room> findByCinemaId(Integer cinemaId);
    boolean existsByCinemaIdAndName(Integer cinemaId, String name);
}
