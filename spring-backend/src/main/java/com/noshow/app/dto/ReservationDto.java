package com.noshow.app.dto;

import com.noshow.app.domain.entity.Reservation;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ReservationDto {
  private Long reservationId;
  private Reservation.Status status;
  private Integer partySize;
  private LocalDateTime scheduledStart;
  private LocalDateTime scheduledEnd;
  private BigDecimal totalPriceAtBooking;
  private BigDecimal depositAmount;
  private String cancelReason;
  private String currency;
  private VenueDto venue;
  private VenueServiceDto service;
  private List<PaymentDto> payments;
  private Boolean hasReview;

  public static ReservationDto fromEntity(Reservation reservation, boolean includePayments) {
    return fromEntity(reservation, includePayments, null);
  }

  public static ReservationDto fromEntity(Reservation reservation, boolean includePayments, Boolean hasReview) {
    List<PaymentDto> paymentDtos = null;
    if (includePayments && reservation.getPayments() != null) {
      paymentDtos = reservation.getPayments().stream()
        .map(PaymentDto::fromEntity)
        .collect(Collectors.toList());
    }

    return ReservationDto.builder()
      .reservationId(reservation.getReservationId())
      .status(reservation.getStatus())
      .partySize(reservation.getPartySize())
      .scheduledStart(reservation.getScheduledStart())
      .scheduledEnd(reservation.getScheduledEnd())
      .totalPriceAtBooking(reservation.getTotalPriceAtBooking())
      .depositAmount(reservation.getDepositAmount())
      .cancelReason(reservation.getCancelReason())
      .currency(reservation.getCurrency())
      .venue(reservation.getVenue() != null ? VenueDto.fromEntity(reservation.getVenue(), false) : null)
      .service(reservation.getService() != null ? VenueServiceDto.fromEntity(reservation.getService()) : null)
      .payments(paymentDtos)
      .hasReview(hasReview)
      .build();
  }
}
