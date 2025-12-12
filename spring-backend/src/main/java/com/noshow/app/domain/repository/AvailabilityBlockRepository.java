package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.AvailabilityBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvailabilityBlockRepository extends JpaRepository<AvailabilityBlock, Long> {
  List<AvailabilityBlock> findByVenue_VenueId(Long venueId);
  List<AvailabilityBlock> findByVenue_VenueIdAndBlockDate(Long venueId, java.time.LocalDate blockDate);
}
