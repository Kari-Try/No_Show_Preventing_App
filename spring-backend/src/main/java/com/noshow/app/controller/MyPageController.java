package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.domain.entity.Reservation;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.UserGrade;
import com.noshow.app.domain.repository.ReservationRepository;
import com.noshow.app.domain.repository.UserGradeRepository;
import com.noshow.app.dto.MyPageResponse;
import com.noshow.app.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {
  private final AuthService authService;
  private final ReservationRepository reservationRepository;
  private final UserGradeRepository userGradeRepository;

  @GetMapping
  public ApiResponse<MyPageResponse> me(HttpServletRequest request) {
    User user = authService.requireUser(request);

    UserGrade grade = user.getGrade();
    if (grade == null) {
      grade = userGradeRepository.findFirstByIsDefaultTrueOrderByPriorityAsc().orElse(null);
    }

    long total = reservationRepository.countByCustomer_UserId(user.getUserId());
    long completed = reservationRepository.countByCustomer_UserIdAndStatus(user.getUserId(), Reservation.Status.COMPLETED);
    long noShow = reservationRepository.countByCustomer_UserIdAndStatus(user.getUserId(), Reservation.Status.NO_SHOW);
    double rate = (completed + noShow) > 0 ? (double) completed / (completed + noShow) : 0.0;

    MyPageResponse dto = MyPageResponse.builder()
      .userId(user.getUserId())
      .username(user.getUsername())
      .realName(user.getRealName())
      .email(user.getEmail())
      .phone(user.getPhone())
      .gradeName(grade != null ? grade.getGradeName() : null)
      .gradeDiscountPercent(grade != null ? grade.getDepositDiscountPercent() : null)
      .totalReservations(total)
      .completedReservations(completed)
      .noShowReservations(noShow)
      .completionRate(rate)
      .build();

    return ApiResponse.ok(dto);
  }
}
