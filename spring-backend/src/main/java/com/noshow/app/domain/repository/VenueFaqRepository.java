package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.VenueFaq;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueFaqRepository extends JpaRepository<VenueFaq, Long> {
  List<VenueFaq> findByVenue_VenueIdOrderByCreatedAtDesc(Long venueId);
}
