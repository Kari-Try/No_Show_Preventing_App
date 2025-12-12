package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.OwnerReplyRequest;
import com.noshow.app.dto.ReviewDto;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner/reviews")
@RequiredArgsConstructor
public class OwnerReviewController {
  private final ReviewService reviewService;
  private final AuthService authService;

  @PostMapping("/{reviewId}/reply")
  public ApiResponse<ReviewDto> reply(@PathVariable Long reviewId,
                                      @Valid @RequestBody OwnerReplyRequest request,
                                      HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    return ApiResponse.ok(reviewService.ownerReply(reviewId, request.getReply(), owner));
  }
}
