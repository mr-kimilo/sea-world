package com.seaworld.repository;

import com.seaworld.entity.CustomScoreCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 自定义积分维度仓储接口
 */
@Repository
public interface CustomScoreCategoryRepository extends JpaRepository<CustomScoreCategory, UUID> {

    /**
     * 根据家庭ID查询所有自定义维度
     */
    List<CustomScoreCategory> findByFamilyIdOrderByCreatedAtAsc(UUID familyId);

    /**
     * 根据家庭ID和名称查询自定义维度（用于唯一性检查）
     */
    Optional<CustomScoreCategory> findByFamilyIdAndName(UUID familyId, String name);

    /**
     * 检查某个维度是否存在
     */
    boolean existsByFamilyIdAndId(UUID familyId, UUID categoryId);

    /**
     * 删除家庭的所有自定义维度
     */
    void deleteByFamilyId(UUID familyId);
}
