package com.noshow.app.service;

import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.Venue;
import com.noshow.app.domain.entity.VenueFaq;
import com.noshow.app.domain.repository.VenueFaqRepository;
import com.noshow.app.domain.repository.VenueRepository;
import com.noshow.app.dto.CreateFaqRequest;
import com.noshow.app.dto.FaqDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueFaqService {
  private final VenueRepository venueRepository;
  private final VenueFaqRepository venueFaqRepository;

  @Transactional(readOnly = true)
  public List<FaqDto> listByVenue(Long venueId, boolean onlyActive) {
    return venueFaqRepository.findByVenue_VenueIdOrderByCreatedAtDesc(venueId).stream()
      .filter(f -> !onlyActive || Boolean.TRUE.equals(f.getIsActive()))
      .map(FaqDto::fromEntity)
      .collect(Collectors.toList());
  }

  @Transactional
  public FaqDto create(CreateFaqRequest req, User owner) {
    Venue venue = venueRepository.findById(req.getVenueId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
    ensureOwner(venue, owner);

    VenueFaq faq = VenueFaq.builder()
      .venue(venue)
      .question(req.getQuestion())
      .answer(req.getAnswer())
      .isActive(req.getIsActive() != null ? req.getIsActive() : true)
      .build();
    venueFaqRepository.save(faq);
    return FaqDto.fromEntity(faq);
  }

  @Transactional
  public FaqDto update(Long faqId, CreateFaqRequest req, User owner) {
    VenueFaq faq = venueFaqRepository.findById(faqId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FAQ not found"));
    ensureOwner(faq.getVenue(), owner);

    faq.setQuestion(req.getQuestion());
    faq.setAnswer(req.getAnswer());
    faq.setIsActive(req.getIsActive() != null ? req.getIsActive() : faq.getIsActive());
    venueFaqRepository.save(faq);
    return FaqDto.fromEntity(faq);
  }

  @Transactional
  public void delete(Long faqId, User owner) {
    VenueFaq faq = venueFaqRepository.findById(faqId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FAQ not found"));
    ensureOwner(faq.getVenue(), owner);
    venueFaqRepository.delete(faq);
  }

  private void ensureOwner(Venue venue, User owner) {
    if (venue == null || owner == null || !venue.getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can manage FAQ");
    }
  }
}
