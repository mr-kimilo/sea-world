package com.seaworld.repository;

import com.seaworld.entity.ScoreCategory;
import com.seaworld.entity.ScoreRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScoreRecordRepository extends JpaRepository<ScoreRecord, UUID> {

    Page<ScoreRecord> findByChildIdOrderByCreatedAtDesc(UUID childId, Pageable pageable);

    Page<ScoreRecord> findByChildIdAndCategoryOrderByCreatedAtDesc(UUID childId, ScoreCategory category, Pageable pageable);

    Page<ScoreRecord> findByChildIdAndRecordDateBetweenOrderByCreatedAtDesc(
            UUID childId, LocalDate start, LocalDate end, Pageable pageable);

    Page<ScoreRecord> findByChildIdAndCategoryAndRecordDateBetweenOrderByCreatedAtDesc(
            UUID childId, ScoreCategory category, LocalDate start, LocalDate end, Pageable pageable);

    Page<ScoreRecord> findByChildIdAndCustomCategoryIdOrderByCreatedAtDesc(
            UUID childId, UUID customCategoryId, Pageable pageable);

    Page<ScoreRecord> findByChildIdAndCustomCategoryIdAndRecordDateBetweenOrderByCreatedAtDesc(
            UUID childId, UUID customCategoryId, LocalDate start, LocalDate end, Pageable pageable);

    @Query("SELECT COALESCE(SUM(s.score), 0) FROM ScoreRecord s WHERE s.childId = :childId AND s.recordDate = :date AND s.score > 0")
    int sumPositiveScoreByChildIdAndDate(@Param("childId") UUID childId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(ABS(s.score)), 0) FROM ScoreRecord s WHERE s.childId = :childId AND s.recordDate = :date AND s.score < 0")
    int sumNegativeScoreByChildIdAndDate(@Param("childId") UUID childId, @Param("date") LocalDate date);

    @Query("SELECT s.category, COALESCE(SUM(s.score), 0) FROM ScoreRecord s WHERE s.childId = :childId AND s.recordDate BETWEEN :start AND :end GROUP BY s.category")
    List<Object[]> sumScoreByChildIdAndDateRangeGroupByCategory(
            @Param("childId") UUID childId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * 统计使用特定自定义维度的积分记录数量
     */
    long countByCustomCategoryId(UUID customCategoryId);
}
