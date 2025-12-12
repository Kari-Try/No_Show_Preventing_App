package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.Reservation;
import com.noshow.app.domain.entity.Reservation.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
  Page<Reservation> findByCustomer_UserId(String userId, Pageable pageable);
  Page<Reservation> findByCustomer_UserIdAndStatus(String userId, Status status, Pageable pageable);
  long countByCustomer_UserId(String userId);
  long countByCustomer_UserIdAndStatus(String userId, Status status);
  boolean existsByServiceAndStatusInAndScheduledStartLessThanAndScheduledEndGreaterThan(
    com.noshow.app.domain.entity.VenueService service,
    Collection<Status> statuses,
    java.time.LocalDateTime end,
    java.time.LocalDateTime start);
  List<Reservation> findByVenue_VenueId(Long venueId);
  Page<Reservation> findByVenue_VenueId(Long venueId, Pageable pageable);
  List<Reservation> findByStatusAndCreatedAtBefore(Status status, java.time.LocalDateTime before);
}
