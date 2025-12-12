package com.noshow.app.service;

import com.noshow.app.common.Pagination;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.Venue;
import com.noshow.app.domain.entity.VenueService;
import com.noshow.app.domain.entity.BusinessHour;
import com.noshow.app.domain.entity.AvailabilityBlock;
import com.noshow.app.domain.repository.VenueRepository;
import com.noshow.app.domain.repository.VenueServiceRepository;
import com.noshow.app.domain.repository.BusinessHourRepository;
import com.noshow.app.domain.repository.AvailabilityBlockRepository;
import com.noshow.app.dto.CreateVenueRequest;
import com.noshow.app.dto.CreateVenueServiceRequest;
import com.noshow.app.dto.CreateBusinessHourRequest;
import com.noshow.app.dto.CreateAvailabilityBlockRequest;
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
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueAppService {
  private final VenueRepository venueRepository;
  private final VenueServiceRepository venueServiceRepository;
  private final BusinessHourRepository businessHourRepository;
  private final AvailabilityBlockRepository availabilityBlockRepository;

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

  @Transactional(readOnly = true)
 public List<BusinessHour> businessHours(Long venueId) {
    return businessHourRepository.findByVenue_VenueId(venueId);
  }

  @Transactional(readOnly = true)
  public List<AvailabilityBlock> blocks(Long venueId) {
    return availabilityBlockRepository.findByVenue_VenueId(venueId);
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
      .minPartySize(dto.getMinPartySize() != null ? dto.getMinPartySize() : 1)
      .maxPartySize(dto.getMaxPartySize() != null ? dto.getMaxPartySize() : 1)
      .depositRatePercent(dto.getDepositRatePercent())
      .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
      .build();
    return venueServiceRepository.save(service);
  }

  @Transactional
  public VenueService createService(CreateVenueServiceRequest req, User owner) {
    Venue venue = getVenue(req.getVenueId());
    if (!venue.getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can add services");
    }
    VenueService service = VenueService.builder()
      .venue(venue)
      .serviceName(req.getServiceName())
      .description(req.getDescription())
      .price(req.getPrice())
      .durationMinutes(req.getDurationMinutes())
      .minPartySize(req.getMinPartySize())
      .maxPartySize(req.getMaxPartySize())
      .depositRatePercent(req.getDepositRatePercent())
      .isActive(true)
      .build();
    return venueServiceRepository.save(service);
  }

  @Transactional
  public VenueService updateService(Long serviceId, CreateVenueServiceRequest req, User owner) {
    VenueService service = venueServiceRepository.findById(serviceId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
    if (!service.getVenue().getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can update services");
    }
    service.setServiceName(req.getServiceName());
    service.setDescription(req.getDescription());
    service.setPrice(req.getPrice());
    service.setDurationMinutes(req.getDurationMinutes());
    service.setMinPartySize(req.getMinPartySize());
    service.setMaxPartySize(req.getMaxPartySize());
    service.setDepositRatePercent(req.getDepositRatePercent());
    return venueServiceRepository.save(service);
  }

  @Transactional
  public void deleteService(Long serviceId, User owner) {
    VenueService service = venueServiceRepository.findById(serviceId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
    if (!service.getVenue().getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can delete services");
    }
    venueServiceRepository.delete(service);
  }

  @Transactional
  public BusinessHour addBusinessHour(Long venueId, CreateBusinessHourRequest req, User owner) {
    Venue venue = getVenue(venueId);
    if (!venue.getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can manage business hours");
    }
    LocalTime open = LocalTime.parse(req.getOpenTime());
    LocalTime close = LocalTime.parse(req.getCloseTime());
    ensureHalfHour(open);
    ensureHalfHour(close);
    if (!open.isBefore(close)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Open time must be before close time");
    }
    List<BusinessHour> sameDay = businessHourRepository.findByVenue_VenueIdAndDayOfWeek(venueId, req.getDayOfWeek());
    boolean overlaps = sameDay.stream().anyMatch(bh ->
      open.isBefore(bh.getCloseTime()) && close.isAfter(bh.getOpenTime())
    );
    if (overlaps) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "같은 요일에 겹치는 영업시간이 있습니다.");
    }

    BusinessHour bh = BusinessHour.builder()
      .venue(venue)
      .dayOfWeek(req.getDayOfWeek())
      .openTime(open)
      .closeTime(close)
      .build();
    return businessHourRepository.save(bh);
  }

  @Transactional
  public AvailabilityBlock addAvailabilityBlock(Long venueId, CreateAvailabilityBlockRequest req, User owner) {
    Venue venue = getVenue(venueId);
    if (!venue.getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can manage availability");
    }
    LocalTime start = LocalTime.parse(req.getStartTime());
    LocalTime end = LocalTime.parse(req.getEndTime());
    ensureHalfHour(start);
    ensureHalfHour(end);
    if (!start.isBefore(end)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
    }
    List<AvailabilityBlock> sameDate = availabilityBlockRepository.findByVenue_VenueIdAndBlockDate(venueId, LocalDate.parse(req.getBlockDate()));
    boolean overlapsBlock = sameDate.stream().anyMatch(b ->
      start.isBefore(b.getEndTime()) && end.isAfter(b.getStartTime())
    );
    if (overlapsBlock) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 날짜에 겹치는 예약 불가 시간이 있습니다.");
    }

    AvailabilityBlock block = AvailabilityBlock.builder()
      .venue(venue)
      .blockDate(LocalDate.parse(req.getBlockDate()))
      .startTime(start)
      .endTime(end)
      .reason(req.getReason())
      .build();
    return availabilityBlockRepository.save(block);
  }

  private void ensureHalfHour(LocalTime time) {
    if (time.getMinute() % 30 != 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시간은 30분 단위로만 설정 가능합니다.");
    }
  }

  @Transactional
  public void deleteBusinessHour(Long businessHourId, User owner) {
    BusinessHour bh = businessHourRepository.findById(businessHourId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Business hour not found"));
    if (!bh.getVenue().getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can delete business hours");
    }
    businessHourRepository.delete(bh);
  }

  @Transactional
  public void deleteBlock(Long blockId, User owner) {
    AvailabilityBlock block = availabilityBlockRepository.findById(blockId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Block not found"));
    if (!block.getVenue().getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can delete blocks");
    }
    availabilityBlockRepository.delete(block);
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
