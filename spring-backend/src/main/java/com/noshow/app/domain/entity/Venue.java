package com.noshow.app.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "venues")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Venue {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "venue_id")
  private Long venueId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_user_id", nullable = false)
  @ToString.Exclude
  private User owner;

  @Column(name = "venue_name", nullable = false, length = 100)
  private String venueName;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Column(name = "base_price", nullable = false)
  private BigDecimal basePrice;

  @Column(name = "default_deposit_rate_percent", nullable = false)
  private Double defaultDepositRatePercent;

  @Column(name = "currency", nullable = false, length = 3)
  private String currency;

  @Column(name = "timezone", nullable = false, length = 50)
  private String timezone;

  @Column(name = "address_line1", length = 200)
  private String addressLine1;

  @Column(name = "address_line2", length = 200)
  private String addressLine2;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  @CreationTimestamp
  @Column(name = "created_at", insertable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", insertable = false)
  private LocalDateTime updatedAt;

  @OneToMany(mappedBy = "venue", fetch = FetchType.LAZY)
  @ToString.Exclude
  private Set<VenueService> services = new HashSet<>();
}
