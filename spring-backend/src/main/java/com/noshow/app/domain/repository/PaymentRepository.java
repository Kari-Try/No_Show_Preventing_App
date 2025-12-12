package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  List<Payment> findByReservation_ReservationId(Long reservationId);
}
