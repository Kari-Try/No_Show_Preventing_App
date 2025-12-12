package com.noshow.app.dto;

import com.noshow.app.domain.entity.VenueFaq;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FaqDto {
  private Long faqId;
  private Long venueId;
  private String question;
  private String answer;
  private Boolean isActive;
  private LocalDateTime createdAt;

  public static FaqDto fromEntity(VenueFaq faq) {
    return FaqDto.builder()
      .faqId(faq.getFaqId())
      .venueId(faq.getVenue() != null ? faq.getVenue().getVenueId() : null)
      .question(faq.getQuestion())
      .answer(faq.getAnswer())
      .isActive(faq.getIsActive())
      .createdAt(faq.getCreatedAt())
      .build();
  }
}
