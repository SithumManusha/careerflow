package com.careerflow.repository;

import com.careerflow.entity.UserScanRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserScanRecordRepository extends JpaRepository<UserScanRecord, Long> {
    List<UserScanRecord> findByUserIdOrderByScannedAtDesc(Long userId);
}
