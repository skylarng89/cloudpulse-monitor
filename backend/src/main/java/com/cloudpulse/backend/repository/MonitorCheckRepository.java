package com.cloudpulse.backend.repository;

import com.cloudpulse.backend.model.MonitorCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MonitorCheckRepository extends JpaRepository<MonitorCheck, UUID> {
}
