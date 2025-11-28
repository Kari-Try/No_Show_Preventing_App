package com.noshow.app.service;

import com.noshow.app.common.Pagination;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.Venue;
import com.noshow.app.domain.entity.VenueService;
import com.noshow.app.domain.repository.VenueRepository;
import com.noshow.app.domain.repository.VenueServiceRepository;
import com.noshow.app.dto.CreateVenueRequest;
import com.noshow.app.dto.VenueDto;
import com.noshow.app.dto.VenueServiceDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueAppService {
  private final VenueRepository venueRepository;
  private final VenueServiceRepository venueServiceRepository;

  @Transactional(readOnly = true)
  public Page<Venue> listVenues(int page, int limit, String search) {
    PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, "createdAt"));
    if (search != null && !search.isBlank()) {
      return venueRepository.findByVenueNameContainingIgnoreCaseAndIsActiveTrue(search, pageable);
    }
    return venueRepository.findByIsActiveTrue(pageable);
  }

  @Transactional
  public Venue createVenue(CreateVenueRequest request, User owner) {
    Venue venue = Venue.builder()
      .owner(owner)
      .venueName(request.getVenueName())
      .description(request.getDescription())
      .basePrice(request.getBasePrice() != null ? request.getBasePrice() : BigDecimal.ZERO)
      .defaultDepositRatePercent(request.getDefaultDepositRatePercent())
      .currency("KRW")
      .timezone("Asia/Seoul")
      .addressLine1(request.getAddress())
      .addressLine2(request.getAddressDetail())
      .isActive(true)
      .build();
    return venueRepository.save(venue);
  }

  @Transactional
  public void deleteVenue(Long venueId, User owner) {
    Venue venue = venueRepository.findById(venueId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
    if (!venue.getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can delete venue");
    }
    venueRepository.delete(venue);
  }

  @Transactional(readOnly = true)
  public Venue getVenue(Long id) {
    return venueRepository.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
  }

  @Transactional(readOnly = true)
  public List<VenueServiceDto> servicesByVenue(Long venueId) {
    return venueServiceRepository.findByVenue_VenueId(venueId).stream()
      .map(VenueServiceDto::fromEntity)
      .collect(Collectors.toList());
  }

  @Transactional
  public VenueService addService(Long venueId, VenueServiceDto dto, User owner) {
    Venue venue = getVenue(venueId);
    if (!venue.getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can add services");
    }
    VenueService service = VenueService.builder()
      .venue(venue)
      .serviceName(dto.getServiceName())
      .description(dto.getDescription())
      .price(dto.getPrice())
      .durationMinutes(dto.getDurationMinutes())
      .capacity(dto.getCapacity() != null ? dto.getCapacity() : 1)
      .depositRatePercent(dto.getDepositRatePercent())
      .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
      .build();
    return venueServiceRepository.save(service);
  }

  public Pagination toPagination(Page<?> page) {
    return new Pagination(page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages());
  }

  public List<VenueDto> toVenueDtos(Page<Venue> page, boolean includeServices) {
    return page.getContent().stream()
      .map(v -> VenueDto.fromEntity(v, includeServices))
      .collect(Collectors.toList());
  }
}
