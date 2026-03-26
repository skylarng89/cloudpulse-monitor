package com.cloudpulse.backend.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.Socket;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class NetworkCheckService {
    private static final Logger log = LoggerFactory.getLogger(NetworkCheckService.class);
    
    // Virtual thread per task optimal client structure under JDK 25
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public static class CheckResult {
        public boolean success;
        public int responseTimeMs;
        public Integer statusCode; // can be null for non-http
        public String status;
        public String error;
        
        public CheckResult(boolean success, int responseTimeMs, Integer statusCode, String status, String error) {
            this.success = success;
            this.responseTimeMs = responseTimeMs;
            this.statusCode = statusCode;
            this.status = status;
            this.error = error;
        }
    }

    @CircuitBreaker(name = "default")
    @Bulkhead(name = "default")
    public CheckResult checkHttp(String url) {
        long start = System.currentTimeMillis();
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
                    
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int statusCode = response.statusCode();
            boolean success = statusCode >= 200 && statusCode < 400;
            int duration = (int) (System.currentTimeMillis() - start);
            return new CheckResult(success, duration, statusCode, success ? "UP" : "DOWN", null);
        } catch (Exception e) {
            int duration = (int) (System.currentTimeMillis() - start);
            log.warn("HTTP check failed for {}: {}", url, e.getMessage());
            return new CheckResult(false, duration, null, "DOWN", e.getMessage());
        }
    }

    @CircuitBreaker(name = "default")
    @Bulkhead(name = "default")
    public CheckResult checkPing(String host) {
        long start = System.currentTimeMillis();
        try {
            boolean reachable = InetAddress.getByName(host).isReachable(5000);
            int duration = (int) (System.currentTimeMillis() - start);
            return new CheckResult(reachable, duration, null, reachable ? "UP" : "DOWN", reachable ? null : "Host unreachable");
        } catch (Exception e) {
            int duration = (int) (System.currentTimeMillis() - start);
            return new CheckResult(false, duration, null, "DOWN", e.getMessage());
        }
    }

    @CircuitBreaker(name = "default")
    @Bulkhead(name = "default")
    public CheckResult checkTcp(String host, int port) {
        long start = System.currentTimeMillis();
        try (Socket socket = new Socket()) {
            socket.connect(new java.net.InetSocketAddress(host, port), 5000);
            int duration = (int) (System.currentTimeMillis() - start);
            return new CheckResult(true, duration, null, "UP", null);
        } catch (Exception e) {
            int duration = (int) (System.currentTimeMillis() - start);
            return new CheckResult(false, duration, null, "DOWN", e.getMessage());
        }
    }
}
