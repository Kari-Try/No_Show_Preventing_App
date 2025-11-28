package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.Reservation;
import com.noshow.app.domain.entity.Reservation.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
  Page<Reservation> findByCustomer_UserId(String userId, Pageable pageable);
  Page<Reservation> findByCustomer_UserIdAndStatus(String userId, Status status, Pageable pageable);
}
