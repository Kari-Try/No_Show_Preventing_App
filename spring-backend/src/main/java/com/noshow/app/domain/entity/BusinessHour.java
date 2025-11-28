package com.noshow.app.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "business_hours")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class BusinessHour {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "business_hour_id")
  @EqualsAndHashCode.Include
  private Long businessHourId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "venue_id", nullable = false)
  @JsonIgnore
  private Venue venue;

  @Column(name = "day_of_week", nullable = false)
  private Integer dayOfWeek; // 0=Sun .. 6=Sat

  @Column(name = "open_time", nullable = false)
  private java.time.LocalTime openTime;

  @Column(name = "close_time", nullable = false)
  private java.time.LocalTime closeTime;
}
