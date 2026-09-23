package com.careerflow.repository;

import com.careerflow.entity.UserCVDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserCVDraftRepository extends JpaRepository<UserCVDraft, Long> {
    List<UserCVDraft> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
