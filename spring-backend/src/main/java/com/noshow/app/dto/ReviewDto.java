package com.noshow.app.dto;

import com.noshow.app.domain.entity.Review;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewDto {
  private Long reviewId;
  private Integer rating;
  private String content;
  private String ownerReply;
  private String imageUrl;
  private LocalDateTime createdAt;
  private UserDto user;

  public static ReviewDto fromEntity(Review review) {
    return ReviewDto.builder()
      .reviewId(review.getReviewId())
      .rating(review.getRating())
      .content(review.getContent())
      .ownerReply(review.getOwnerReply())
      .imageUrl(review.getImageUrl())
      .createdAt(review.getCreatedAt())
      .user(review.getUser() != null ? UserDto.fromEntity(review.getUser()) : null)
      .build();
  }
}
