package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
  List<Review> findByVenue_VenueIdOrderByCreatedAtDesc(Long venueId);
}
