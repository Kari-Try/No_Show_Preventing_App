package com.noshow.app.service;

import com.noshow.app.common.Pagination;
import com.noshow.app.domain.entity.Payment;
import com.noshow.app.domain.entity.Reservation;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.UserGrade;
import com.noshow.app.domain.entity.VenueService;
import com.noshow.app.domain.repository.PaymentRepository;
import com.noshow.app.domain.repository.ReservationRepository;
import com.noshow.app.domain.repository.ReviewRepository;
import com.noshow.app.domain.repository.UserGradeRepository;
import com.noshow.app.domain.repository.VenueServiceRepository;
import com.noshow.app.domain.repository.BusinessHourRepository;
import com.noshow.app.domain.repository.AvailabilityBlockRepository;
import com.noshow.app.dto.CancelReservationRequest;
import com.noshow.app.dto.CreateReservationRequest;
import com.noshow.app.dto.PaymentDto;
import com.noshow.app.dto.ReservationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {
  private static final Duration DEPOSIT_TIMEOUT = Duration.ofMinutes(10);
  private static final String DEPOSIT_TIMEOUT_REASON = "Deposit payment window expired";

  private final ReservationRepository reservationRepository;
  private final VenueServiceRepository venueServiceRepository;
  private final UserGradeRepository userGradeRepository;
  private final PaymentRepository paymentRepository;
  private final ReviewRepository reviewRepository;
  private final BusinessHourRepository businessHourRepository;
  private final AvailabilityBlockRepository availabilityBlockRepository;

  @Transactional
  public ReservationDto createReservation(CreateReservationRequest request, User customer) {
    // Only customers can book (owners/admin 차단)
    if (customer.getUserRoles() != null) {
      boolean blocked = customer.getUserRoles().stream()
        .anyMatch(ur -> {
          String rn = ur.getRole().getRoleName().toLowerCase();
          return "owner".equals(rn) || "admin".equals(rn);
        });
      if (blocked) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "사업자/관리자는 예약할 수 없습니다.");
      }
    }

    VenueService service = venueServiceRepository.findById(request.getServiceId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));

    LocalDateTime start = parseDateTime(request.getScheduledStart());
    LocalDateTime end = start.plusMinutes(service.getDurationMinutes());

    // 30분 단위 체크
    if (start.getMinute() % 30 != 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예약 시간은 30분 단위로만 가능합니다.");
    }

    // party size validation
    int minParty = service.getMinPartySize() != null ? service.getMinPartySize() : 1;
    int maxParty = service.getMaxPartySize() != null ? service.getMaxPartySize() : minParty;
    if (request.getPartySize() < minParty || request.getPartySize() > maxParty) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "인원은 " + minParty + " ~ " + maxParty + "명만 가능합니다.");
    }

    // business hours validation (30m aligned)
    LocalDate date = start.toLocalDate();
    int dow = start.getDayOfWeek().getValue() % 7; // Java Mon=1 -> 1; we need 0=Sun
    List<com.noshow.app.domain.entity.BusinessHour> hours = businessHourRepository.findByVenue_VenueId(service.getVenue().getVenueId());
    boolean withinHours = hours.stream().anyMatch(h -> {
      if (h.getDayOfWeek() != dow) return false;
      LocalTime open = h.getOpenTime();
      LocalTime close = h.getCloseTime();
      return !start.toLocalTime().isBefore(open) && !end.toLocalTime().isAfter(close);
    });
    if (!withinHours) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "영업 시간 내에서만 예약 가능합니다.");
    }

    // availability blocks validation
    List<com.noshow.app.domain.entity.AvailabilityBlock> blocks = availabilityBlockRepository.findByVenue_VenueId(service.getVenue().getVenueId());
    boolean blocked = blocks.stream().anyMatch(b -> {
      if (!b.getBlockDate().equals(date)) return false;
      LocalTime s = b.getStartTime();
      LocalTime e = b.getEndTime();
      return start.toLocalTime().isBefore(e) && end.toLocalTime().isAfter(s);
    });
    if (blocked) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 시간은 예약이 불가합니다.");
    }

    // overlap validation with active reservations
    List<Reservation.Status> activeStatuses = List.of(Reservation.Status.DEPOSIT_PENDING, Reservation.Status.BOOKED);
    boolean overlap = reservationRepository.existsByServiceAndStatusInAndScheduledStartLessThanAndScheduledEndGreaterThan(
      service, activeStatuses, end, start);
    if (overlap) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 시간대는 이미 예약 진행 중입니다.");
    }

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
      .status(Reservation.Status.DEPOSIT_PENDING)
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

  private LocalDateTime parseDateTime(String value) {
    try {
      if (value.endsWith("Z") || value.matches(".*[+-]\\d{2}:?\\d{2}$")) {
        // convert to server default timezone
        return OffsetDateTime.parse(value).atZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
      }
      return LocalDateTime.parse(value);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 시간 형식입니다.");
    }
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
      .map(r -> ReservationDto.fromEntity(r, true, reviewRepository.existsByReservation_ReservationId(r.getReservationId())))
      .collect(Collectors.toList());
    Pagination pagination = new Pagination(result.getNumber() + 1, result.getSize(), result.getTotalElements(), result.getTotalPages());
    return new ReservationsPage(data, pagination);
  }

  @Transactional(readOnly = true)
  public ReservationsPage listOwnerReservations(User owner, Long venueId, int page, int limit) {
    VenueService dummy = new VenueService(); // just to avoid import issues (not used)
    PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, "bookedAt"));
    Page<Reservation> result = reservationRepository.findByVenue_VenueId(venueId, pageable);
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
    if (reservation.getStatus() != Reservation.Status.BOOKED && reservation.getStatus() != Reservation.Status.DEPOSIT_PENDING) {
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

    // 환불 처리 (보증금 결제된 경우)
    refundDepositIfExists(reservation, user);

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

    if (reservation.getStatus() == Reservation.Status.DEPOSIT_PENDING) {
      LocalDateTime base = reservation.getCreatedAt() != null ? reservation.getCreatedAt() : LocalDateTime.now();
      LocalDateTime expiry = base.plus(DEPOSIT_TIMEOUT);
      if (LocalDateTime.now().isAfter(expiry)) {
        reservation.setStatus(Reservation.Status.CANCELED);
        reservation.setCanceledAt(LocalDateTime.now());
        reservation.setCancelReason(DEPOSIT_TIMEOUT_REASON);
        reservationRepository.save(reservation);
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "??? ?? ??? ???????.");
      }
    }

    if (reservation.getStatus() != Reservation.Status.DEPOSIT_PENDING) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "??? ?? ??? ????.");
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
    reservation.setStatus(Reservation.Status.BOOKED);
    reservationRepository.save(reservation);
    return PaymentDto.fromEntity(payment);
  }

  @Transactional
  public ReservationDto ownerUpdateStatus(Long reservationId, String action, String reason, User owner) {
    Reservation reservation = reservationRepository.findById(reservationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

    if (!reservation.getVenue().getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only venue owner can manage reservations");
    }

    if ("NO_SHOW".equalsIgnoreCase(action)) {
      reservation.setStatus(Reservation.Status.NO_SHOW);
    } else if ("CANCEL".equalsIgnoreCase(action)) {
      reservation.setStatus(Reservation.Status.CANCELED);
      reservation.setCancelReason(reason);
      reservation.setCanceledAt(LocalDateTime.now());
      reservation.setCanceledBy(owner);
      refundDepositIfExists(reservation, owner);
    } else if ("COMPLETE".equalsIgnoreCase(action) || "COMPLETED".equalsIgnoreCase(action)) {
      reservation.setStatus(Reservation.Status.COMPLETED);
    } else {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid action");
    }

    reservationRepository.save(reservation);
    return ReservationDto.fromEntity(reservation, true);
  }

  @Transactional
  @Scheduled(fixedDelayString = "${app.deposit-expire-scan-ms:60000}")
  public void expireStaleDepositPending() {
    LocalDateTime cutoff = LocalDateTime.now().minus(DEPOSIT_TIMEOUT);
    List<Reservation> expired = reservationRepository.findByStatusAndCreatedAtBefore(
      Reservation.Status.DEPOSIT_PENDING, cutoff);
    if (expired.isEmpty()) {
      return;
    }
    LocalDateTime now = LocalDateTime.now();
    expired.forEach(r -> {
      r.setStatus(Reservation.Status.CANCELED);
      r.setCanceledAt(now);
      r.setCancelReason(DEPOSIT_TIMEOUT_REASON);
    });
    reservationRepository.saveAll(expired);
  }

  public record ReservationsPage(List<ReservationDto> data, Pagination pagination) {}

  /**
   * 이미 결제된 보증금이 있으면 REFUND 레코드를 추가한다.
   */
  private void refundDepositIfExists(Reservation reservation, User actor) {
    if (reservation.getDepositAmount() == null || reservation.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0) {
      return;
    }
    Payment deposit = reservation.getPayments() == null ? null :
      reservation.getPayments().stream()
        .filter(p -> p.getPaymentType() == Payment.PaymentType.DEPOSIT && p.getStatus() == Payment.Status.CAPTURED)
        .max(Comparator.comparing(Payment::getPaidAt, Comparator.nullsLast(Comparator.naturalOrder())))
        .orElse(null);
    if (deposit == null) return;

    Payment refund = Payment.builder()
      .reservation(reservation)
      .payer(actor != null ? actor : reservation.getCustomer())
      .paymentType(Payment.PaymentType.REFUND)
      .method(deposit.getMethod())
      .amount(reservation.getDepositAmount())
      .currency(reservation.getCurrency())
      .status(Payment.Status.CAPTURED)
      .relatedPayment(deposit)
      .paidAt(LocalDateTime.now())
      .build();
    paymentRepository.save(refund);
  }
}
