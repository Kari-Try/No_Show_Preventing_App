package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
  List<Review> findByVenue_VenueIdOrderByCreatedAtDesc(Long venueId);
  Optional<Review> findByReservation_ReservationId(Long reservationId);
  boolean existsByReservation_ReservationId(Long reservationId);
  List<Review> findByUser_UserIdOrderByCreatedAtDesc(String userId);
}
