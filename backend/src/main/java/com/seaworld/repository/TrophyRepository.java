package com.seaworld.repository;

import com.seaworld.entity.Trophy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TrophyRepository extends JpaRepository<Trophy, UUID> {
    List<Trophy> findByChildIdOrderByEarnedAtDesc(UUID childId);

    @Query("SELECT t FROM Trophy t WHERE t.childId = ?1 ORDER BY t.points DESC LIMIT 3")
    List<Trophy> findTop3ByChildIdOrderByPointsDesc(UUID childId);
}
