package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.UserGrade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserGradeRepository extends JpaRepository<UserGrade, Short> {
  Optional<UserGrade> findFirstByIsDefaultTrueOrderByPriorityAsc();
}
