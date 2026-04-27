package com.seaworld.service;

import com.seaworld.dto.ChildRequest;
import com.seaworld.dto.ChildResponse;
import com.seaworld.dto.CreateFamilyRequest;
import com.seaworld.dto.FamilyResponse;
import com.seaworld.entity.Child;
import com.seaworld.entity.Family;
import com.seaworld.entity.FamilyMember;
import com.seaworld.entity.User;
import com.seaworld.exception.ForbiddenException;
import com.seaworld.exception.ResourceNotFoundException;
import com.seaworld.repository.ChildRepository;
import com.seaworld.repository.FamilyMemberRepository;
import com.seaworld.repository.FamilyRepository;
import com.seaworld.util.ErrorMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final ChildRepository childRepository;

    @Transactional
    public FamilyResponse createFamily(User requester, CreateFamilyRequest request) {
        Family family = Family.builder()
                .name(request.getName())
                .createdBy(requester.getId())
                .build();
        family = familyRepository.save(family);

        FamilyMember member = FamilyMember.builder()
                .familyId(family.getId())
                .userId(requester.getId())
                .role("owner")
                .build();
        familyMemberRepository.save(member);

        return FamilyResponse.from(family);
    }

    public List<FamilyResponse> getMyFamilies(User requester) {
        return familyMemberRepository.findByUserId(requester.getId()).stream()
                .map(member -> familyRepository.findById(member.getFamilyId())
                        .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.FAMILY_NOT_FOUND.getMessage())))
                .map(FamilyResponse::from)
                .toList();
    }

    @Transactional
    public ChildResponse addChild(User requester, UUID familyId, ChildRequest request) {
        requireFamilyMember(requester.getId(), familyId);

        Child child = Child.builder()
                .familyId(familyId)
                .name(request.getName())
                .nickname(request.getNickname())
                .avatarUrl(request.getAvatarUrl())
                .birthDate(request.getBirthDate())
                .build();
        child = childRepository.save(child);

        return ChildResponse.from(child);
    }

    public List<ChildResponse> getChildren(User requester, UUID familyId) {
        requireFamilyMember(requester.getId(), familyId);
        return childRepository.findByFamilyIdOrderByCreatedAt(familyId).stream()
                .map(ChildResponse::from)
                .toList();
    }

    @Transactional
    public ChildResponse updateChild(User requester, UUID familyId, UUID childId, ChildRequest request) {
        requireFamilyMember(requester.getId(), familyId);
        Child child = requireChildInFamily(childId, familyId);

        child.setName(request.getName());
        child.setNickname(request.getNickname());
        child.setAvatarUrl(request.getAvatarUrl());
        child.setBirthDate(request.getBirthDate());
        child = childRepository.save(child);

        return ChildResponse.from(child);
    }

    @Transactional
    public void deleteChild(User requester, UUID familyId, UUID childId) {
        requireFamilyMember(requester.getId(), familyId);
        Child child = requireChildInFamily(childId, familyId);
        childRepository.delete(child);
    }

    @Transactional
    public FamilyResponse updateFamily(User requester, UUID familyId, com.seaworld.dto.UpdateFamilyRequest request) {
        requireFamilyMember(requester.getId(), familyId);
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.FAMILY_NOT_FOUND.getMessage()));
        
        family.setName(request.getName());
        family = familyRepository.save(family);
        
        return FamilyResponse.from(family);
    }

    // ---- helpers ----

    /**
     * 获取用户的主家庭ID（第一个家庭）
     */
    public UUID getUserFamilyId(UUID userId) {
        return familyMemberRepository.findByUserId(userId).stream()
                .findFirst()
                .map(FamilyMember::getFamilyId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.FAMILY_NOT_FOUND.getMessage()));
    }

    public void requireFamilyMember(UUID userId, UUID familyId) {
        if (!familyMemberRepository.existsByFamilyIdAndUserId(familyId, userId)) {
            throw new ForbiddenException(ErrorMessages.NOT_FAMILY_MEMBER.getMessage());
        }
    }

    private Child requireChildInFamily(UUID childId, UUID familyId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.CHILD_NOT_FOUND.getMessage()));
        if (!child.getFamilyId().equals(familyId)) {
            throw new ForbiddenException(ErrorMessages.CHILD_NOT_IN_FAMILY.getMessage());
        }
        return child;
    }
}
