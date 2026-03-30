package com.cloudpulse.backend.controller;

import com.cloudpulse.backend.model.Monitor;
import com.cloudpulse.backend.model.MonitorCheck;
import com.cloudpulse.backend.repository.MonitorCheckRepository;
import com.cloudpulse.backend.repository.MonitorRepository;
import com.cloudpulse.backend.service.NetworkCheckService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/scheduler")
public class SchedulerController {

    private final MonitorRepository monitorRepository;
    private final MonitorCheckRepository checkRepository;
    private final NetworkCheckService checkService;

    public SchedulerController(MonitorRepository monitorRepository,
                               MonitorCheckRepository checkRepository,
                               NetworkCheckService checkService) {
        this.monitorRepository = monitorRepository;
        this.checkRepository = checkRepository;
        this.checkService = checkService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("running", true);
        status.put("intervalMs", 10000);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> start() {
        return ResponseEntity.ok(Map.of("message", "Scheduler started"));
    }

    @PostMapping("/stop")
    public ResponseEntity<Map<String, String>> stop() {
        return ResponseEntity.ok(Map.of("message", "Scheduler stopped"));
    }

    @PostMapping("/restart")
    public ResponseEntity<Map<String, String>> restart() {
        return ResponseEntity.ok(Map.of("message", "Scheduler restarted"));
    }

    @PostMapping("/run/{id}")
    public ResponseEntity<MonitorCheck> runCheck(@PathVariable UUID id) {
        Optional<Monitor> monitorOpt = monitorRepository.findById(id);
        if (monitorOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Monitor monitor = monitorOpt.get();
        NetworkCheckService.CheckResult result = performCheck(monitor);

        MonitorCheck check = new MonitorCheck();
        check.setMonitorId(monitor.getId());
        check.setResponseTimeMs(result.responseTimeMs);
        check.setStatusCode(result.statusCode);
        check.setStatus(result.status);
        check.setErrorMessage(result.error);
        check = checkRepository.save(check);

        if (!result.status.equals(monitor.getStatus())) {
            monitor.setStatus(result.status);
            monitorRepository.save(monitor);
        }

        return ResponseEntity.ok(check);
    }

    private NetworkCheckService.CheckResult performCheck(Monitor monitor) {
        String type = monitor.getType() != null ? monitor.getType().toUpperCase() : "PING";

        return switch (type) {
            case "HTTP", "HTTPS" -> checkService.checkHttp(monitor.getUrl());
            case "TCP" -> {
                String[] parts = monitor.getUrl().split(":");
                String host = parts[0];
                int port = parts.length > 1 ? Integer.parseInt(parts[1]) : 80;
                yield checkService.checkTcp(host, port);
            }
            default -> checkService.checkPing(monitor.getUrl());
        };
    }
}
