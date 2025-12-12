package com.noshow.app.service;

import com.noshow.app.domain.entity.Reservation;
import com.noshow.app.domain.entity.Review;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.Venue;
import com.noshow.app.domain.repository.ReservationRepository;
import com.noshow.app.domain.repository.VenueRepository;
import com.noshow.app.domain.repository.ReviewRepository;
import com.noshow.app.dto.CreateReviewRequest;
import com.noshow.app.dto.ReviewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
  private final ReviewRepository reviewRepository;
  private final ReservationRepository reservationRepository;
  private final VenueRepository venueRepository;

  @Transactional(readOnly = true)
  public List<ReviewDto> reviewsByVenue(Long venueId) {
    return reviewRepository.findByVenue_VenueIdOrderByCreatedAtDesc(venueId).stream()
      .map(r -> {
        ReviewDto dto = ReviewDto.fromEntity(r);
        dto.setHasImage(r.getImageData() != null);
        return dto;
      })
      .collect(Collectors.toList());
  }

  @Transactional
  public ReviewDto createReview(CreateReviewRequest request, User writer, byte[] imageBytes, String mimeType) {
    Reservation reservation = reservationRepository.findById(request.getReservationId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

    if (!reservation.getCustomer().getUserId().equals(writer.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Reviews can only be written by the customer");
    }
    if (reservation.getStatus() != Reservation.Status.COMPLETED) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only completed reservations can be reviewed");
    }
    if (reviewRepository.existsByReservation_ReservationId(reservation.getReservationId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 리뷰를 작성했습니다.");
    }

    Review review = Review.builder()
      .reservation(reservation)
      .venue(reservation.getVenue())
      .user(writer)
      .rating(request.getRating())
      .content(request.getContent())
      .imageData(imageBytes)
      .imageMimeType(mimeType)
      .build();

    reviewRepository.save(review);
    ReviewDto dto = ReviewDto.fromEntity(review);
    dto.setHasImage(imageBytes != null);
    return dto;
  }

  @Transactional(readOnly = true)
  public List<ReviewDto> reviewsByUser(String userId) {
    return reviewRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
      .map(r -> {
        ReviewDto dto = ReviewDto.fromEntity(r);
        dto.setHasImage(r.getImageData() != null);
        return dto;
      })
      .collect(Collectors.toList());
  }

  @Transactional
  public ReviewDto ownerReply(Long reviewId, String reply, User owner) {
    Review review = reviewRepository.findById(reviewId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
    if (review.getVenue() == null || review.getVenue().getVenueId() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review without venue cannot be replied");
    }
    Venue venue = venueRepository.findById(review.getVenue().getVenueId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
    if (!venue.getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only venue owner can reply");
    }
    review.setOwnerReply(reply);
    review.setOwnerReplyAt(java.time.LocalDateTime.now());
    reviewRepository.save(review);
    ReviewDto dto = ReviewDto.fromEntity(review);
    dto.setHasImage(review.getImageData() != null);
    return dto;
  }
}
