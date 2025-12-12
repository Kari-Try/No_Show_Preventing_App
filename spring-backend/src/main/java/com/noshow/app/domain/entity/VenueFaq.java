package com.noshow.app.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "venue_faq")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueFaq {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "faq_id")
  private Long faqId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "venue_id", nullable = false)
  private Venue venue;

  @Column(name = "question", nullable = false, length = 200)
  private String question;

  @Column(name = "answer", nullable = false, columnDefinition = "TEXT")
  private String answer;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  @CreationTimestamp
  @Column(name = "created_at", insertable = false, updatable = false)
  private LocalDateTime createdAt;
}
