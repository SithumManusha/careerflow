package com.careerflow.repository;

import com.careerflow.entity.ATSAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ATSAuditRepository extends JpaRepository<ATSAudit, Long> {
    List<ATSAudit> findTop10ByOrderByScannedAtDesc();
}
