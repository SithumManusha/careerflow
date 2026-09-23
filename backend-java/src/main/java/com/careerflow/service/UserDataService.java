package com.careerflow.service;

import com.careerflow.dto.UserCVDraftDTO;
import com.careerflow.dto.UserScanDTO;
import com.careerflow.entity.UserCVDraft;
import com.careerflow.entity.UserScanRecord;
import com.careerflow.repository.UserCVDraftRepository;
import com.careerflow.repository.UserScanRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDataService {

    private final UserScanRecordRepository scanRecordRepository;
    private final UserCVDraftRepository cvDraftRepository;

    public UserDataService(UserScanRecordRepository scanRecordRepository, UserCVDraftRepository cvDraftRepository) {
        this.scanRecordRepository = scanRecordRepository;
        this.cvDraftRepository = cvDraftRepository;
    }

    public List<UserScanDTO> getUserScans(Long userId) {
        return scanRecordRepository.findByUserIdOrderByScannedAtDesc(userId).stream()
                .map(this::toScanDTO)
                .collect(Collectors.toList());
    }

    public UserScanDTO saveScan(Long userId, UserScanDTO dto) {
        UserScanRecord record = new UserScanRecord(
                userId,
                dto.getJobTitle(),
                dto.getTargetRole(),
                dto.getJobMatchScore(),
                dto.getAtsHealthScore(),
                dto.getMissingKeywordsJson()
        );
        record = scanRecordRepository.save(record);
        return toScanDTO(record);
    }

    public void deleteScan(Long userId, Long scanId) {
        scanRecordRepository.findById(scanId).ifPresent(record -> {
            if (record.getUserId().equals(userId)) {
                scanRecordRepository.delete(record);
            }
        });
    }

    public List<UserCVDraftDTO> getUserDrafts(Long userId) {
        return cvDraftRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(this::toDraftDTO)
                .collect(Collectors.toList());
    }

    public UserCVDraftDTO saveOrUpdateDraft(Long userId, UserCVDraftDTO dto) {
        UserCVDraft draft;
        if (dto.getId() != null) {
            draft = cvDraftRepository.findById(dto.getId())
                    .filter(d -> d.getUserId().equals(userId))
                    .orElse(new UserCVDraft());
        } else {
            draft = new UserCVDraft();
        }

        draft.setUserId(userId);
        draft.setDraftTitle(dto.getDraftTitle() != null && !dto.getDraftTitle().isBlank() ? dto.getDraftTitle() : "Untitled CV Draft");
        draft.setTargetRole(dto.getTargetRole());
        draft.setResumeDataJson(dto.getResumeDataJson());
        draft.setUpdatedAt(LocalDateTime.now());

        draft = cvDraftRepository.save(draft);
        return toDraftDTO(draft);
    }

    public void deleteDraft(Long userId, Long draftId) {
        cvDraftRepository.findById(draftId).ifPresent(draft -> {
            if (draft.getUserId().equals(userId)) {
                cvDraftRepository.delete(draft);
            }
        });
    }

    private UserScanDTO toScanDTO(UserScanRecord r) {
        UserScanDTO dto = new UserScanDTO();
        dto.setId(r.getId());
        dto.setJobTitle(r.getJobTitle());
        dto.setTargetRole(r.getTargetRole());
        dto.setJobMatchScore(r.getJobMatchScore());
        dto.setAtsHealthScore(r.getAtsHealthScore());
        dto.setMissingKeywordsJson(r.getMissingKeywordsJson());
        dto.setScannedAt(r.getScannedAt());
        return dto;
    }

    private UserCVDraftDTO toDraftDTO(UserCVDraft d) {
        UserCVDraftDTO dto = new UserCVDraftDTO();
        dto.setId(d.getId());
        dto.setDraftTitle(d.getDraftTitle());
        dto.setTargetRole(d.getTargetRole());
        dto.setResumeDataJson(d.getResumeDataJson());
        dto.setUpdatedAt(d.getUpdatedAt());
        return dto;
    }
}
