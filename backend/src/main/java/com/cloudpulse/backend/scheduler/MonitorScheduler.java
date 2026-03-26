package com.cloudpulse.backend.scheduler;

import com.cloudpulse.backend.model.Monitor;
import com.cloudpulse.backend.model.MonitorCheck;
import com.cloudpulse.backend.repository.MonitorCheckRepository;
import com.cloudpulse.backend.repository.MonitorRepository;
import com.cloudpulse.backend.service.NetworkCheckService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class MonitorScheduler {

    private final MonitorRepository monitorRepository;
    private final MonitorCheckRepository checkRepository;
    private final NetworkCheckService checkService;

    public MonitorScheduler(MonitorRepository monitorRepository, MonitorCheckRepository checkRepository, NetworkCheckService checkService) {
        this.monitorRepository = monitorRepository;
        this.checkRepository = checkRepository;
        this.checkService = checkService;
    }

    // A simple fixedDelay for demonstration per requirements.
    // In reality, this would query dynamically based on intervalSeconds.
    @Scheduled(fixedDelay = 10000)
    public void runChecks() {
        List<Monitor> monitors = monitorRepository.findAll();
        for (Monitor monitor : monitors) {
            // Processing executed via Java Virtual Threads explicitly to simulate massive parallelism
            Thread.startVirtualThread(() -> processMonitor(monitor));
        }
    }

    @Transactional
    public void processMonitor(Monitor monitor) {
        NetworkCheckService.CheckResult result;
        String type = monitor.getType() != null ? monitor.getType().toUpperCase() : "PING";

        switch (type) {
            case "HTTP":
            case "HTTPS":
                result = checkService.checkHttp(monitor.getUrl());
                break;
            case "TCP":
                String[] parts = monitor.getUrl().split(":");
                String host = parts[0];
                int port = parts.length > 1 ? Integer.parseInt(parts[1]) : 80;
                result = checkService.checkTcp(host, port);
                break;
            case "PING":
            default:
                // Assuming URL stores host for ping
                result = checkService.checkPing(monitor.getUrl());
                break;
        }

        MonitorCheck check = new MonitorCheck();
        check.setMonitorId(monitor.getId());
        check.setResponseTimeMs(result.responseTimeMs);
        check.setStatusCode(result.statusCode);
        check.setStatus(result.status);
        check.setErrorMessage(result.error);
        
        checkRepository.save(check);

        if (!result.status.equals(monitor.getStatus())) {
            monitor.setStatus(result.status);
            monitorRepository.save(monitor);
        }
    }
}
