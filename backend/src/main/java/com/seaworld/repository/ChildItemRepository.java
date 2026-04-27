package com.seaworld.repository;

import com.seaworld.entity.ChildItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChildItemRepository extends JpaRepository<ChildItem, UUID> {

    List<ChildItem> findByChildIdOrderByAcquiredAt(UUID childId);

    boolean existsByChildIdAndItemId(UUID childId, UUID itemId);

    Optional<ChildItem> findByChildIdAndItemId(UUID childId, UUID itemId);
}
