package com.noshow.app.service;

import com.noshow.app.common.Pagination;
import com.noshow.app.domain.entity.Payment;
import com.noshow.app.domain.entity.Reservation;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.UserGrade;
import com.noshow.app.domain.entity.VenueService;
import com.noshow.app.domain.repository.PaymentRepository;
import com.noshow.app.domain.repository.ReservationRepository;
import com.noshow.app.domain.repository.UserGradeRepository;
import com.noshow.app.domain.repository.VenueServiceRepository;
import com.noshow.app.dto.CancelReservationRequest;
import com.noshow.app.dto.CreateReservationRequest;
import com.noshow.app.dto.PaymentDto;
import com.noshow.app.dto.ReservationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {
  private final ReservationRepository reservationRepository;
  private final VenueServiceRepository venueServiceRepository;
  private final UserGradeRepository userGradeRepository;
  private final PaymentRepository paymentRepository;

  @Transactional
  public ReservationDto createReservation(CreateReservationRequest request, User customer) {
    VenueService service = venueServiceRepository.findById(request.getServiceId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));

    LocalDateTime start = LocalDateTime.parse(request.getScheduledStart());
    LocalDateTime end = start.plusMinutes(service.getDurationMinutes());

    BigDecimal totalPrice = service.getPrice().multiply(BigDecimal.valueOf(request.getPartySize()));
    double depositRate = service.getDepositRatePercent() != null
      ? service.getDepositRatePercent()
      : service.getVenue().getDefaultDepositRatePercent();

    UserGrade grade = customer.getGrade();
    double discount = grade != null && grade.getDepositDiscountPercent() != null
      ? grade.getDepositDiscountPercent() : 0.0;

    BigDecimal depositAmount = totalPrice
      .multiply(BigDecimal.valueOf(depositRate / 100.0))
      .multiply(BigDecimal.valueOf(1 - (discount / 100.0)))
      .setScale(0, RoundingMode.HALF_UP);

    Reservation reservation = Reservation.builder()
      .customer(customer)
      .venue(service.getVenue())
      .service(service)
      .partySize(request.getPartySize())
      .scheduledStart(start)
      .scheduledEnd(end)
      .status(Reservation.Status.BOOKED)
      .totalPriceAtBooking(totalPrice)
      .appliedDepositRatePercent(depositRate)
      .appliedGrade(grade != null ? grade : userGradeRepository.findFirstByIsDefaultTrueOrderByPriorityAsc().orElse(null))
      .appliedGradeDiscountPercent(discount)
      .depositAmount(depositAmount)
      .currency(service.getVenue().getCurrency())
      .build();

    reservationRepository.save(reservation);
    return ReservationDto.fromEntity(reservation, true);
  }

  @Transactional(readOnly = true)
  public ReservationsPage listMyReservations(User user, int page, int limit, String status) {
    PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, "bookedAt"));
    Page<Reservation> result = reservationRepository.findByCustomer_UserId(user.getUserId(), pageable);
    if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
      Reservation.Status st = Reservation.Status.valueOf(status);
      result = reservationRepository.findByCustomer_UserIdAndStatus(user.getUserId(), st, pageable);
    }
    List<ReservationDto> data = result.getContent().stream()
      .map(r -> ReservationDto.fromEntity(r, true))
      .collect(Collectors.toList());
    Pagination pagination = new Pagination(result.getNumber() + 1, result.getSize(), result.getTotalElements(), result.getTotalPages());
    return new ReservationsPage(data, pagination);
  }

  @Transactional
  public ReservationDto cancelReservation(Long reservationId, CancelReservationRequest request, User user) {
    Reservation reservation = reservationRepository.findById(reservationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

    if (!reservation.getCustomer().getUserId().equals(user.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can cancel");
    }
    if (reservation.getStatus() != Reservation.Status.BOOKED) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation is not cancellable");
    }

    LocalDateTime now = LocalDateTime.now();
    if (Duration.between(now, reservation.getScheduledStart()).toHours() < 24) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancellations are allowed up to 24h before start");
    }

    reservation.setStatus(Reservation.Status.CANCELED);
    reservation.setCancelReason(request.getCancelReason());
    reservation.setCanceledAt(now);
    reservation.setCanceledBy(user);

    reservationRepository.save(reservation);
    return ReservationDto.fromEntity(reservation, true);
  }

  @Transactional
  public PaymentDto payDeposit(Long reservationId, String paymentMethod, User payer) {
    Reservation reservation = reservationRepository.findById(reservationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

    if (!reservation.getCustomer().getUserId().equals(payer.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the booker can pay the deposit");
    }

    boolean alreadyPaid = reservation.getPayments().stream()
      .anyMatch(p -> p.getPaymentType() == Payment.PaymentType.DEPOSIT && p.getStatus() == Payment.Status.CAPTURED);
    if (alreadyPaid) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deposit already paid");
    }

    Payment payment = Payment.builder()
      .reservation(reservation)
      .payer(payer)
      .paymentType(Payment.PaymentType.DEPOSIT)
      .method(paymentMethod)
      .amount(reservation.getDepositAmount())
      .currency(reservation.getCurrency())
      .status(Payment.Status.CAPTURED)
      .paidAt(LocalDateTime.now())
      .build();

    paymentRepository.save(payment);
    return PaymentDto.fromEntity(payment);
  }

  public record ReservationsPage(List<ReservationDto> data, Pagination pagination) {}
}
