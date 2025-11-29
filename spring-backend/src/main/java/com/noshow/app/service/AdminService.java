package com.noshow.app.service;

import com.noshow.app.common.Pagination;
import com.noshow.app.common.PageResult;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.repository.AdminViewRepository;
import com.noshow.app.domain.repository.UserRepository;
import com.noshow.app.dto.AdminStatsDto;
import com.noshow.app.dto.GradeCountDto;
import com.noshow.app.dto.MonthlyReservationStatDto;
import com.noshow.app.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
  private final AdminViewRepository adminViewRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public AdminStatsDto overview() {
    Object raw = adminViewRepository.overviewRaw();
    if (raw == null) {
      return AdminStatsDto.builder().build();
    }
    Object[] arr = (Object[]) raw;
    return AdminStatsDto.builder()
      .totalUsers(((Number) arr[0]).longValue())
      .totalOwners(((Number) arr[1]).longValue())
      .totalCustomers(((Number) arr[2]).longValue())
      .totalVenues(((Number) arr[3]).longValue())
      .reservationsThisMonth(((Number) arr[4]).longValue())
      .noshowsThisMonth(((Number) arr[5]).longValue())
      .build();
  }

  @Transactional(readOnly = true)
  public List<MonthlyReservationStatDto> monthlyStats() {
    return adminViewRepository.monthlyStatsRaw().stream()
      .map(r -> new MonthlyReservationStatDto(
        (String) r[0],
        ((Number) r[1]).longValue(),
        ((Number) r[2]).longValue(),
        ((Number) r[3]).longValue(),
        ((Number) r[4]).longValue()
      ))
      .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<GradeCountDto> gradeCounts() {
    return adminViewRepository.gradeCountsRaw().stream()
      .map(r -> new GradeCountDto((String) r[0], ((Number) r[1]).longValue()))
      .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public PageResult<UserDto> listUsers(String role, String gradeName, int page, int size) {
    PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<User> p;
    if (role != null && !role.isBlank()) {
      p = userRepository.findByRoleName(role.toLowerCase(), pageable);
    } else if (gradeName != null && !gradeName.isBlank()) {
      p = userRepository.findByGrade_GradeNameIgnoreCase(gradeName, pageable);
    } else {
      p = userRepository.findAll(pageable);
    }
    List<UserDto> dtos = p.getContent().stream().map(UserDto::fromEntity).collect(Collectors.toList());
    return new PageResult<>(dtos, new Pagination(p.getNumber() + 1, p.getSize(), p.getTotalElements(), p.getTotalPages()));
  }
}
