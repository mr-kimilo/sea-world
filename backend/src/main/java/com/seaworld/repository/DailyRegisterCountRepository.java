package com.seaworld.repository;

import com.seaworld.entity.DailyRegisterCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface DailyRegisterCountRepository extends JpaRepository<DailyRegisterCount, LocalDate> {
}
