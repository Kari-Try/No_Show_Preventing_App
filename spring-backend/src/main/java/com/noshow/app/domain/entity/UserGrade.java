package com.noshow.app.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_grades")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGrade {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "grade_id")
  private Short gradeId;

  @Column(name = "grade_name", nullable = false, unique = true, length = 30)
  private String gradeName;

  @Column(name = "grade_code", length = 32)
  private String gradeCode;

  @Column(name = "deposit_discount_percent", nullable = false)
  private Double depositDiscountPercent;

  @Column(name = "min_success_reservations", nullable = false)
  private Integer minSuccessReservations;

  @Column(name = "priority", nullable = false)
  private Integer priority;

  @Column(name = "is_default", nullable = false)
  private Boolean isDefault;

  @Column(name = "require_no_show_zero", nullable = false)
  private Boolean requireNoShowZero;

  @Column(name = "max_no_show_rate")
  private Double maxNoShowRate;
}
