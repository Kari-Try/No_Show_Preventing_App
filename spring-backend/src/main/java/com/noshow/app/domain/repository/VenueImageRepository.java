package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.VenueImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {
  List<VenueImage> findByVenue_VenueIdOrderByCreatedAtDesc(Long venueId);
}
