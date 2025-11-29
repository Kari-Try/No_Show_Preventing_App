package com.noshow.app.domain.repository;

import com.noshow.app.dto.AdminStatsDto;
import com.noshow.app.dto.GradeCountDto;
import com.noshow.app.dto.MonthlyReservationStatDto;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface AdminViewRepository extends Repository<com.noshow.app.domain.entity.User, String> {

  @Query(value = "SELECT total_users, total_owners, total_customers, total_venues, reservations_this_month, noshows_this_month FROM v_admin_overview LIMIT 1", nativeQuery = true)
  Object overviewRaw();

  @Query(value = "SELECT ym, total_resv, noshow_cnt, completed_cnt, canceled_cnt FROM v_monthly_reservation_stats ORDER BY ym DESC", nativeQuery = true)
  List<Object[]> monthlyStatsRaw();

  @Query(value = """
    SELECT g.grade_name,
           COALESCE(t.cnt, 0) AS users_in_grade
    FROM user_grades g
    LEFT JOIN (
      SELECT u.grade_id, COUNT(*) AS cnt
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.user_id
      JOIN roles r ON r.role_id = ur.role_id AND r.role_name = 'customer'
      GROUP BY u.grade_id
    ) t ON t.grade_id = g.grade_id
    ORDER BY users_in_grade DESC
    """, nativeQuery = true)
  List<Object[]> gradeCountsRaw();
}
