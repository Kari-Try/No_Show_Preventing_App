package com.noshow.app.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "reservations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
  public enum Status {
    BOOKED, COMPLETED, CANCELED, NO_SHOW
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "reservation_id")
  private Long reservationId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "customer_user_id", nullable = false)
  @ToString.Exclude
  private User customer;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "venue_id", nullable = false)
  @ToString.Exclude
  private Venue venue;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "service_id", nullable = false)
  @ToString.Exclude
  private VenueService service;

  @Column(name = "party_size", nullable = false)
  private Integer partySize;

  @Column(name = "scheduled_start", nullable = false)
  private LocalDateTime scheduledStart;

  @Column(name = "scheduled_end", nullable = false)
  private LocalDateTime scheduledEnd;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status;

  @CreationTimestamp
  @Column(name = "booked_at", insertable = false, updatable = false)
  private LocalDateTime bookedAt;

  @Column(name = "canceled_at")
  private LocalDateTime canceledAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "canceled_by_user_id")
  private User canceledBy;

  @Column(name = "cancel_reason", length = 200)
  private String cancelReason;

  @Column(name = "no_show_marked_at")
  private LocalDateTime noShowMarkedAt;

  @Column(name = "total_price_at_booking", nullable = false)
  private BigDecimal totalPriceAtBooking;

  @Column(name = "applied_deposit_rate_percent", nullable = false)
  private Double appliedDepositRatePercent;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "applied_grade_id", nullable = false)
  private UserGrade appliedGrade;

  @Column(name = "applied_grade_discount_percent", nullable = false)
  private Double appliedGradeDiscountPercent;

  @Column(name = "deposit_amount", nullable = false)
  private BigDecimal depositAmount;

  @Column(name = "currency", nullable = false, length = 3)
  private String currency;

  @CreationTimestamp
  @Column(name = "created_at", insertable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", insertable = false)
  private LocalDateTime updatedAt;

  @OneToMany(mappedBy = "reservation", fetch = FetchType.LAZY)
  @ToString.Exclude
  private Set<Payment> payments = new HashSet<>();
}
