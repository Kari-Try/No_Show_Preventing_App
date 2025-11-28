package com.noshow.app.controller;

import com.noshow.app.domain.entity.Review;
import com.noshow.app.domain.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewImageController {
  private final ReviewRepository reviewRepository;

  @GetMapping("/{id}/image")
  public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
    Review review = reviewRepository.findById(id).orElse(null);
    if (review == null || review.getImageData() == null) {
      return ResponseEntity.notFound().build();
    }
    HttpHeaders headers = new HttpHeaders();
    headers.set(HttpHeaders.CONTENT_TYPE, review.getImageMimeType() != null ? review.getImageMimeType() : "application/octet-stream");
    return ResponseEntity.ok().headers(headers).body(review.getImageData());
  }
}
