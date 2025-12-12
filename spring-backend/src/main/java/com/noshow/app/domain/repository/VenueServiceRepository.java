package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.VenueService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueServiceRepository extends JpaRepository<VenueService, Long> {
  List<VenueService> findByVenue_VenueId(Long venueId);
}
