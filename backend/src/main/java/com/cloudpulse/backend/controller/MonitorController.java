package com.cloudpulse.backend.controller;

import com.cloudpulse.backend.dto.MonitorDto;
import com.cloudpulse.backend.model.IdempotencyKey;
import com.cloudpulse.backend.model.Monitor;
import com.cloudpulse.backend.repository.IdempotencyRepository;
import com.cloudpulse.backend.repository.MonitorCheckRepository;
import com.cloudpulse.backend.repository.MonitorRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/monitors")
public class MonitorController {

    private static final Logger log = LoggerFactory.getLogger(MonitorController.class);

    private final MonitorRepository monitorRepository;
    private final MonitorCheckRepository checkRepository;
    private final IdempotencyRepository idempotencyRepository;
    private final ObjectMapper objectMapper;

    public MonitorController(MonitorRepository monitorRepository, 
                             MonitorCheckRepository checkRepository, 
                             IdempotencyRepository idempotencyRepository,
                             ObjectMapper objectMapper) {
        this.monitorRepository = monitorRepository;
        this.checkRepository = checkRepository;
        this.idempotencyRepository = idempotencyRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public List<Monitor> getAllMonitors() {
        return monitorRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Monitor> getMonitor(@PathVariable UUID id) {
        return monitorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createMonitor(
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKeyHeader,
            @Valid @RequestBody MonitorDto dto) throws JsonProcessingException {
        
        // 1. Idempotency Check
        if (idempotencyKeyHeader != null) {
            String fullKey = "CREATE_MONITOR_" + idempotencyKeyHeader;
            Optional<IdempotencyKey> existingKey = idempotencyRepository.findById(fullKey);
            if (existingKey.isPresent()) {
                log.info("Idempotency hit for key: {}", fullKey);
                // In a true enterprise app, deserialize the parsed responseBody
                return ResponseEntity.status(existingKey.get().getResponseStatus())
                        .body(objectMapper.readTree(existingKey.get().getResponseBody()));
            }
        }

        // 2. Business Logic
        Monitor monitor = new Monitor();
        monitor.setName(dto.getName());
        monitor.setUrl(dto.getUrl());
        monitor.setType(dto.getType().toUpperCase());
        monitor.setIntervalSeconds(dto.getIntervalSeconds());
        
        try {
            monitor = monitorRepository.save(monitor);
        } catch (Exception e) {
            // Usually catch DataIntegrityViolationException for UNIQUE constraint URL+Type
            log.error("Error saving monitor: Duplicate or integrity issue", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Monitor already exists or violates constraints");
        }

        ResponseEntity<Monitor> response = ResponseEntity.status(HttpStatus.CREATED).body(monitor);

        // 3. Save Idempotency State
        if (idempotencyKeyHeader != null) {
            IdempotencyKey keyRecord = new IdempotencyKey();
            keyRecord.setIdempotencyKey("CREATE_MONITOR_" + idempotencyKeyHeader);
            keyRecord.setOperationType("POST /api/monitors");
            keyRecord.setResponseBody(objectMapper.writeValueAsString(monitor));
            keyRecord.setResponseStatus(HttpStatus.CREATED.value());
            idempotencyRepository.save(keyRecord);
        }

        return response;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMonitor(@PathVariable UUID id) {
        if (!monitorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        monitorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
