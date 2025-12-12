package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.common.Pagination;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.AdminStatsDto;
import com.noshow.app.dto.GradeCountDto;
import com.noshow.app.dto.MonthlyReservationStatDto;
import com.noshow.app.dto.UserDto;
import com.noshow.app.service.AdminService;
import com.noshow.app.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
  private final AdminService adminService;
  private final AuthService authService;

  private void ensureAdmin(User user) {
    boolean isAdmin = user.getUserRoles() != null && user.getUserRoles().stream()
      .anyMatch(ur -> "admin".equalsIgnoreCase(ur.getRole().getRoleName()));
    if (!isAdmin) {
      throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Admin only");
    }
  }

  @GetMapping("/overview")
  public ApiResponse<AdminStatsDto> overview(HttpServletRequest request) {
    User user = authService.requireUser(request);
    ensureAdmin(user);
    return ApiResponse.ok(adminService.overview());
  }

  @GetMapping("/monthly-stats")
  public ApiResponse<List<MonthlyReservationStatDto>> monthlyStats(HttpServletRequest request) {
    User user = authService.requireUser(request);
    ensureAdmin(user);
    return ApiResponse.ok(adminService.monthlyStats());
  }

  @GetMapping("/grade-counts")
  public ApiResponse<List<GradeCountDto>> gradeCounts(HttpServletRequest request) {
    User user = authService.requireUser(request);
    ensureAdmin(user);
    return ApiResponse.ok(adminService.gradeCounts());
  }

  @GetMapping("/users")
  public ApiResponse<List<UserDto>> listUsers(@RequestParam(required = false) String role,
                                              @RequestParam(required = false, name = "grade") String gradeName,
                                              @RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "20") int size,
                                              HttpServletRequest request) {
    User user = authService.requireUser(request);
    ensureAdmin(user);
    var resp = adminService.listUsers(role, gradeName, page, size);
    return ApiResponse.ok(resp.getData(), resp.getPagination());
  }
}
