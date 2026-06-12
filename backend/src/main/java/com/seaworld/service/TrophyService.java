package com.seaworld.service;

import com.seaworld.dto.TrophyResponse;
import com.seaworld.entity.Child;
import com.seaworld.entity.User;
import com.seaworld.exception.ResourceNotFoundException;
import com.seaworld.repository.ChildRepository;
import com.seaworld.repository.TrophyRepository;
import com.seaworld.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrophyService {

    private final TrophyRepository trophyRepository;
    private final ChildRepository childRepository;
    private final FamilyService familyService;

    public List<TrophyResponse> getTrophies(User requester, UUID childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));
        familyService.requireFamilyMember(requester.getId(), child.getFamilyId());
        return trophyRepository.findByChildIdOrderByEarnedAtDesc(childId).stream()
                .map(TrophyResponse::from)
                .toList();
    }

    public List<TrophyResponse> getTop3Trophies(User requester, UUID childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));
        familyService.requireFamilyMember(requester.getId(), child.getFamilyId());
        return trophyRepository.findTop3ByChildIdOrderByPointsDesc(childId).stream()
                .map(TrophyResponse::from)
                .toList();
    }
}
