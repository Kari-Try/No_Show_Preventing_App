package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {
  Page<Venue> findByVenueNameContainingIgnoreCase(String keyword, Pageable pageable);
  Page<Venue> findByVenueNameContainingIgnoreCaseAndIsActiveTrue(String keyword, Pageable pageable);
  Page<Venue> findByIsActiveTrue(Pageable pageable);
}