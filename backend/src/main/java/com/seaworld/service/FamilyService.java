package com.seaworld.service;

import com.seaworld.dto.*;
import com.seaworld.entity.Child;
import com.seaworld.entity.Family;
import com.seaworld.entity.FamilyMember;
import com.seaworld.entity.User;
import com.seaworld.exception.BusinessException;
import com.seaworld.exception.ForbiddenException;
import com.seaworld.exception.ResourceNotFoundException;
import com.seaworld.repository.ChildRepository;
import com.seaworld.repository.FamilyMemberRepository;
import com.seaworld.repository.FamilyRepository;
import com.seaworld.repository.UserRepository;
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
    private final UserRepository userRepository;

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

    // ─── Multi-Parent: Search / Join / Approve ───

    public FamilyResponse searchByShareCode(User requester, String shareCode) {
        Family family = familyRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new BusinessException(ErrorMessages.INVALID_SHARE_CODE.getMessage()));
        return FamilyResponse.from(family);
    }

    @Transactional
    public void requestJoin(User requester, String shareCode) {
        Family family = familyRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new BusinessException(ErrorMessages.INVALID_SHARE_CODE.getMessage()));

        // Check if already a member
        if (familyMemberRepository.existsByFamilyIdAndUserId(family.getId(), requester.getId())) {
            throw new BusinessException(ErrorMessages.FAMILY_MEMBER_ALREADY_EXISTS.getMessage());
        }

        // Check if already has pending request
        if (familyMemberRepository.existsByFamilyIdAndUserIdAndStatus(family.getId(), requester.getId(), "PENDING")) {
            throw new BusinessException(ErrorMessages.FAMILY_JOIN_REQUEST_EXISTS.getMessage());
        }

        FamilyMember pending = FamilyMember.builder()
                .familyId(family.getId())
                .userId(requester.getId())
                .role("member")
                .status("PENDING")
                .build();
        familyMemberRepository.save(pending);
    }

    @Transactional
    public void approveJoin(User requester, UUID familyId, UUID userId) {
        requireFamilyMember(requester.getId(), familyId);

        // Only owner can approve
        FamilyMember requesterMember = familyMemberRepository.findByFamilyIdAndUserId(familyId, requester.getId())
                .orElseThrow(() -> new ForbiddenException(ErrorMessages.NOT_FAMILY_MEMBER.getMessage()));
        if (!"owner".equals(requesterMember.getRole())) {
            throw new ForbiddenException(ErrorMessages.UNAUTHORIZED_OPERATION.getMessage());
        }

        if (requester.getId().equals(userId)) {
            throw new BusinessException(ErrorMessages.CANNOT_APPROVE_OWN_REQUEST.getMessage());
        }

        FamilyMember pending = familyMemberRepository.findByFamilyIdAndUserIdAndStatus(familyId, userId, "PENDING")
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PENDING_REQUEST_NOT_FOUND.getMessage()));

        pending.setStatus("ACTIVE");
        familyMemberRepository.save(pending);
    }

    @Transactional
    public void rejectJoin(User requester, UUID familyId, UUID userId) {
        requireFamilyMember(requester.getId(), familyId);

        FamilyMember requesterMember = familyMemberRepository.findByFamilyIdAndUserId(familyId, requester.getId())
                .orElseThrow(() -> new ForbiddenException(ErrorMessages.NOT_FAMILY_MEMBER.getMessage()));
        if (!"owner".equals(requesterMember.getRole())) {
            throw new ForbiddenException(ErrorMessages.UNAUTHORIZED_OPERATION.getMessage());
        }

        FamilyMember pending = familyMemberRepository.findByFamilyIdAndUserIdAndStatus(familyId, userId, "PENDING")
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PENDING_REQUEST_NOT_FOUND.getMessage()));

        familyMemberRepository.delete(pending);
    }

    public List<FamilyMemberResponse> getMembers(User requester, UUID familyId) {
        requireFamilyMember(requester.getId(), familyId);
        return familyMemberRepository.findByFamilyId(familyId).stream()
                .map(m -> {
                    String email = userRepository.findById(m.getUserId())
                            .map(User::getEmail)
                            .orElse("unknown");
                    return FamilyMemberResponse.from(m, email);
                })
                .toList();
    }

    public List<FamilyMemberResponse> getPendingRequests(User requester, UUID familyId) {
        requireFamilyMember(requester.getId(), familyId);
        return familyMemberRepository.findByFamilyIdAndStatus(familyId, "PENDING").stream()
                .map(m -> {
                    String email = userRepository.findById(m.getUserId())
                            .map(User::getEmail)
                            .orElse("unknown");
                    return FamilyMemberResponse.from(m, email);
                })
                .toList();
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
