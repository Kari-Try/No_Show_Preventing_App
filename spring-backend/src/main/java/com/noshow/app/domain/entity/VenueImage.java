package com.noshow.app.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "venue_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueImage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "image_id")
  private Long imageId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "venue_id", nullable = false)
  private Venue venue;

  @Lob
  @Column(name = "image_data", nullable = false)
  private byte[] imageData;

  @Column(name = "mime_type", nullable = false, length = 100)
  private String mimeType;

  @CreationTimestamp
  @Column(name = "created_at", insertable = false, updatable = false)
  private LocalDateTime createdAt;
}
