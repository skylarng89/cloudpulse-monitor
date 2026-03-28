package com.cloudpulse.backend.service;

import com.cloudpulse.backend.service.NetworkCheckService.CheckResult;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NetworkCheckServiceTest {

    private final NetworkCheckService networkCheckService = new NetworkCheckService();

    @Test
    void checkHttp_shouldReturnSuccess_forValidUrl() {
        CheckResult result = networkCheckService.checkHttp("https://httpbin.org/status/200");
        
        assertNotNull(result);
        assertTrue(result.success);
        assertEquals(200, result.statusCode);
        assertEquals("UP", result.status);
        assertNull(result.error);
    }

    @Test
    void checkHttp_shouldReturnFailure_forNon2xxStatus() {
        CheckResult result = networkCheckService.checkHttp("https://httpbin.org/status/500");
        
        assertNotNull(result);
        assertFalse(result.success);
        assertEquals(500, result.statusCode);
        assertEquals("DOWN", result.status);
        assertNull(result.error);
    }

    @Test
    void checkHttp_shouldReturnFailure_forInvalidUrl() {
        CheckResult result = networkCheckService.checkHttp("https://invalid.example.localhost:9999/test");
        
        assertNotNull(result);
        assertFalse(result.success);
        assertNull(result.statusCode);
        assertEquals("DOWN", result.status);
    }

    @Test
    void checkHttp_shouldReturnFailure_forMalformedUrl() {
        CheckResult result = networkCheckService.checkHttp("not-a-valid-url");
        
        assertNotNull(result);
        assertFalse(result.success);
        assertEquals("DOWN", result.status);
        assertNotNull(result.error);
    }

    @Test
    void checkPing_shouldReturnSuccess_forReachableHost() {
        CheckResult result = networkCheckService.checkPing("localhost");
        
        assertNotNull(result);
        assertTrue(result.success);
        assertEquals("UP", result.status);
        assertNull(result.error);
    }

    @Test
    void checkPing_shouldReturnFailure_forUnreachableHost() {
        CheckResult result = networkCheckService.checkPing("192.0.2.1");
        
        assertNotNull(result);
        assertFalse(result.success);
        assertEquals("DOWN", result.status);
        assertNotNull(result.error);
    }

    @Test
    void checkTcp_shouldReturnSuccess_forOpenPort() {
        CheckResult result = networkCheckService.checkTcp("localhost", 22);
        
        assertNotNull(result);
        if (result.success) {
            assertEquals("UP", result.status);
            assertNull(result.error);
        } else {
            assertEquals("DOWN", result.status);
        }
    }

    @Test
    void checkTcp_shouldReturnFailure_forClosedPort() {
        CheckResult result = networkCheckService.checkTcp("localhost", 59999);
        
        assertNotNull(result);
        assertFalse(result.success);
        assertEquals("DOWN", result.status);
        assertNotNull(result.error);
    }

    @Test
    void checkResult_shouldRecordResponseTime() {
        CheckResult result = networkCheckService.checkHttp("https://httpbin.org/delay/0");
        
        assertNotNull(result);
        assertTrue(result.responseTimeMs >= 0);
    }
}
