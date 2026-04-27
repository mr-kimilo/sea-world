package com.seaworld.service;

import com.seaworld.dto.ScoreRequest;
import com.seaworld.dto.ScoreResponse;
import com.seaworld.entity.Child;
import com.seaworld.entity.CustomScoreCategory;
import com.seaworld.entity.ScoreRecord;
import com.seaworld.entity.User;
import com.seaworld.exception.BusinessException;
import com.seaworld.exception.ForbiddenException;
import com.seaworld.exception.ResourceNotFoundException;
import com.seaworld.repository.ChildRepository;
import com.seaworld.repository.CustomScoreCategoryRepository;
import com.seaworld.repository.ScoreRecordRepository;
import com.seaworld.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private static final int MAX_DAILY_SCORE = 10;

    private final ScoreRecordRepository scoreRecordRepository;
    private final ChildRepository childRepository;
    private final FamilyService familyService;
    private final CustomScoreCategoryRepository customScoreCategoryRepository;

    @Transactional
    public ScoreResponse addScore(User requester, UUID familyId, UUID childId, ScoreRequest request) {
        familyService.requireFamilyMember(requester.getId(), familyId);
        Child child = requireChildInFamily(childId, familyId);

        int score = request.getScore();
        validateDailyLimit(childId, score);

        UUID customCategoryId = request.getCustomCategoryId();
        if (customCategoryId != null) {
            // Ensure the custom category belongs to the same family
            UUID verifiedId = Objects.requireNonNull(customCategoryId);
            boolean ok = customScoreCategoryRepository.existsByFamilyIdAndId(familyId, verifiedId);
            if (!ok) {
                throw new BusinessException(ErrorMessages.CUSTOM_CATEGORY_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND);
            }
        }

        ScoreRecord record = ScoreRecord.builder()
                .childId(childId)
                .operatorId(requester.getId())
                .score(score)
                .category(customCategoryId != null ? com.seaworld.entity.ScoreCategory.custom : request.getCategory())
                .customCategoryId(customCategoryId)
                .reason(request.getReason())
                .build();
        record = scoreRecordRepository.save(record);

        updateChildScore(child, score);

        Map<UUID, CustomScoreCategory> customById = (customCategoryId != null)
                ? customScoreCategoryRepository.findAllById(List.of(Objects.requireNonNull(customCategoryId))).stream()
                    .collect(Collectors.toMap(CustomScoreCategory::getId, Function.identity()))
                : Map.of();
        return ScoreResponse.from(record, customById);
    }

    public Page<ScoreResponse> getHistory(User requester, UUID familyId, UUID childId,
                                          int page, int size, String category, String period) {
        familyService.requireFamilyMember(requester.getId(), familyId);
        requireChildInFamily(childId, familyId);

        Pageable pageable = PageRequest.of(page, size);
        LocalDate[] range = resolveDateRange(period);

        UUID customCategoryId = resolveCustomCategoryId(category);
        com.seaworld.entity.ScoreCategory categoryEnum = (customCategoryId == null) ? resolveCategory(category) : null;

        Page<ScoreRecord> records;
        if (range != null && customCategoryId != null) {
            records = scoreRecordRepository.findByChildIdAndCustomCategoryIdAndRecordDateBetweenOrderByCreatedAtDesc(
                    childId, customCategoryId, range[0], range[1], pageable);
        } else if (customCategoryId != null) {
            records = scoreRecordRepository.findByChildIdAndCustomCategoryIdOrderByCreatedAtDesc(
                    childId, customCategoryId, pageable);
        } else if (range != null && categoryEnum != null) {
            records = scoreRecordRepository.findByChildIdAndCategoryAndRecordDateBetweenOrderByCreatedAtDesc(
                    childId, categoryEnum, range[0], range[1], pageable);
        } else if (range != null) {
            records = scoreRecordRepository.findByChildIdAndRecordDateBetweenOrderByCreatedAtDesc(
                    childId, range[0], range[1], pageable);
        } else if (categoryEnum != null) {
            records = scoreRecordRepository.findByChildIdAndCategoryOrderByCreatedAtDesc(
                    childId, categoryEnum, pageable);
        } else {
            records = scoreRecordRepository.findByChildIdOrderByCreatedAtDesc(childId, pageable);
        }

        List<UUID> customIds = records.getContent().stream()
                .map(ScoreRecord::getCustomCategoryId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<UUID, CustomScoreCategory> customById = customIds.isEmpty()
                ? Map.of()
                : customScoreCategoryRepository.findAllById(customIds).stream()
                    .collect(Collectors.toMap(CustomScoreCategory::getId, Function.identity()));

        return records.map(r -> ScoreResponse.from(r, customById));
    }

    public Map<String, Integer> getCategorySummary(User requester, UUID familyId, UUID childId, String period) {
        familyService.requireFamilyMember(requester.getId(), familyId);
        requireChildInFamily(childId, familyId);

        LocalDate[] range = resolveDateRange(period);
        LocalDate start = (range != null) ? range[0] : LocalDate.now().minusYears(10);
        LocalDate end = (range != null) ? range[1] : LocalDate.now();

        List<Object[]> rows = scoreRecordRepository.sumScoreByChildIdAndDateRangeGroupByCategory(
                childId, start, end);

        Map<String, Integer> result = new LinkedHashMap<>();
        for (com.seaworld.entity.ScoreCategory cat : com.seaworld.entity.ScoreCategory.values()) {
            result.put(cat.name(), 0);
        }
        for (Object[] row : rows) {
            String catName = ((com.seaworld.entity.ScoreCategory) row[0]).name();
            result.put(catName, ((Number) row[1]).intValue());
        }
        return result;
    }

    @Transactional
    public void deleteScore(User requester, UUID familyId, UUID childId, UUID scoreId) {
        familyService.requireFamilyMember(requester.getId(), familyId);
        Child child = requireChildInFamily(childId, familyId);

        ScoreRecord record = scoreRecordRepository.findById(scoreId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.SCORE_NOT_FOUND.getMessage()));

        // 验证记录是否属于该孩子
        if (!record.getChildId().equals(childId)) {
            throw new ForbiddenException(ErrorMessages.SCORE_NOT_FOUND.getMessage());
        }

        // 验证删除权限：只有记录创建者或管理员可以删除
        if (!record.getOperatorId().equals(requester.getId()) && !"admin".equalsIgnoreCase(requester.getRole())) {
            throw new ForbiddenException(ErrorMessages.CANNOT_DELETE_OTHERS_SCORE.getMessage());
        }

        // 回滚孩子的积分
        child.setTotalScore(child.getTotalScore() - record.getScore());
        child.setAvailableScore(child.getAvailableScore() - record.getScore());
        childRepository.save(child);

        // 删除记录
        scoreRecordRepository.delete(record);
    }

    // ---- helpers ----

    private void validateDailyLimit(UUID childId, int score) {
        LocalDate today = LocalDate.now();
        if (score > 0) {
            int dailyPositive = scoreRecordRepository.sumPositiveScoreByChildIdAndDate(childId, today);
            if (dailyPositive + score > MAX_DAILY_SCORE) {
                throw new BusinessException(
                        ErrorMessages.DAILY_POSITIVE_LIMIT_EXCEEDED.format(MAX_DAILY_SCORE),
                        HttpStatus.UNPROCESSABLE_ENTITY);
            }
        } else if (score < 0) {
            int dailyNegative = scoreRecordRepository.sumNegativeScoreByChildIdAndDate(childId, today);
            if (dailyNegative + Math.abs(score) > MAX_DAILY_SCORE) {
                throw new BusinessException(
                        ErrorMessages.DAILY_NEGATIVE_LIMIT_EXCEEDED.format(MAX_DAILY_SCORE),
                        HttpStatus.UNPROCESSABLE_ENTITY);
            }
        }
    }

    private void updateChildScore(Child child, int score) {
        child.setTotalScore(child.getTotalScore() + score);
        child.setAvailableScore(child.getAvailableScore() + score);
        childRepository.save(child);
    }

    private Child requireChildInFamily(UUID childId, UUID familyId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));
        if (!child.getFamilyId().equals(familyId)) {
            throw new ForbiddenException(ErrorMessages.CHILD_NOT_IN_FAMILY.getMessage());
        }
        return child;
    }

    private LocalDate[] resolveDateRange(String period) {
        if (period == null || period.isBlank()) return null;
        LocalDate end = LocalDate.now();
        LocalDate start = switch (period.toLowerCase()) {
            case "day" -> end;
            case "week" -> end.minusDays(6);
            case "month" -> end.minusDays(29);
            case "year" -> end.minusDays(364);
            default -> null;
        };
        return (start != null) ? new LocalDate[]{start, end} : null;
    }

    private com.seaworld.entity.ScoreCategory resolveCategory(String category) {
        if (category == null || category.isBlank()) return null;
        try {
            return com.seaworld.entity.ScoreCategory.valueOf(category.toLowerCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private UUID resolveCustomCategoryId(String category) {
        if (category == null || category.isBlank()) return null;
        try {
            return UUID.fromString(category);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
