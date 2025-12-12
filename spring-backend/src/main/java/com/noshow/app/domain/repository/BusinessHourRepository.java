package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.BusinessHour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusinessHourRepository extends JpaRepository<BusinessHour, Long> {
  List<BusinessHour> findByVenue_VenueId(Long venueId);
  List<BusinessHour> findByVenue_VenueIdAndDayOfWeek(Long venueId, Integer dayOfWeek);
}
