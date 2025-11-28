package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.CreateReviewRequest;
import com.noshow.app.dto.ReviewDto;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
  private final ReviewService reviewService;
  private final AuthService authService;

  @GetMapping("/venue/{venueId}")
  public ApiResponse<List<ReviewDto>> reviewsByVenue(@PathVariable Long venueId) {
    return ApiResponse.ok(reviewService.reviewsByVenue(venueId));
  }

  @PostMapping
  public ApiResponse<ReviewDto> createReview(
    @Valid @RequestBody CreateReviewRequest request,
    HttpServletRequest servletRequest
  ) {
    User user = authService.requireUser(servletRequest);
    return ApiResponse.ok(reviewService.createReview(request, user, null, null));
  }

  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<ReviewDto> createReviewWithImage(
    HttpServletRequest servletRequest,
    @Valid CreateReviewRequest request,
    MultipartFile image
  ) throws Exception {
    User user = authService.requireUser(servletRequest);
    byte[] bytes = null;
    String mime = null;
    if (image != null && !image.isEmpty()) {
      bytes = image.getBytes();
      mime = image.getContentType();
    }
    return ApiResponse.ok(reviewService.createReview(request, user, bytes, mime));
  }

  @GetMapping("/my")
  public ApiResponse<List<ReviewDto>> myReviews(HttpServletRequest servletRequest) {
    User user = authService.requireUser(servletRequest);
    return ApiResponse.ok(reviewService.reviewsByUser(user.getUserId()));
  }
}
