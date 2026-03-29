package com.cloudpulse.backend.controller;

import com.cloudpulse.backend.dto.MonitorDto;
import com.cloudpulse.backend.model.Monitor;
import com.cloudpulse.backend.repository.MonitorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class MonitorControllerIT {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MonitorRepository monitorRepository;

    @BeforeEach
    void setUp() {
        monitorRepository.deleteAll();
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void getAllMonitors_shouldReturnEmptyList_whenNoMonitors() throws Exception {
        mockMvc.perform(get("/api/monitors"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("[]"));
    }

    @Test
    void createMonitor_shouldReturnCreated_whenValidInput() throws Exception {
        MonitorDto dto = new MonitorDto();
        dto.setName("Test Monitor");
        dto.setUrl("https://example.com");
        dto.setType("HTTP");
        dto.setIntervalSeconds(60);

        mockMvc.perform(post("/api/monitors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Test Monitor"))
                .andExpect(jsonPath("$.url").value("https://example.com"))
                .andExpect(jsonPath("$.type").value("HTTP"))
                .andExpect(jsonPath("$.intervalSeconds").value(60))
                .andExpect(jsonPath("$.status").value("UNKNOWN"));
    }

    @Test
    void createMonitor_shouldReturnCreated_withIdempotencyKey() throws Exception {
        MonitorDto dto = new MonitorDto();
        dto.setName("Idempotent Monitor");
        dto.setUrl("https://idempotent-test.com");
        dto.setType("HTTP");
        dto.setIntervalSeconds(30);

        String idempotencyKey = "test-key-" + UUID.randomUUID();
        String json = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/api/monitors")
                .header("X-Idempotency-Key", idempotencyKey)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/monitors")
                .header("X-Idempotency-Key", idempotencyKey)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated());

        long count = monitorRepository.count();
        assertEquals(1, count, "Idempotency should prevent duplicate creation");
    }

    @Test
    void createMonitor_shouldReturnBadRequest_whenNameIsBlank() throws Exception {
        MonitorDto dto = new MonitorDto();
        dto.setName("");
        dto.setUrl("https://example.com");
        dto.setType("HTTP");

        mockMvc.perform(post("/api/monitors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createMonitor_shouldReturnBadRequest_whenUrlIsBlank() throws Exception {
        MonitorDto dto = new MonitorDto();
        dto.setName("Test");
        dto.setUrl("");
        dto.setType("HTTP");

        mockMvc.perform(post("/api/monitors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createMonitor_shouldReturnBadRequest_whenTypeIsInvalid() throws Exception {
        MonitorDto dto = new MonitorDto();
        dto.setName("Test");
        dto.setUrl("https://example.com");
        dto.setType("INVALID");

        mockMvc.perform(post("/api/monitors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createMonitor_shouldReturnBadRequest_whenIntervalTooSmall() throws Exception {
        MonitorDto dto = new MonitorDto();
        dto.setName("Test");
        dto.setUrl("https://example.com");
        dto.setType("HTTP");
        dto.setIntervalSeconds(5);

        mockMvc.perform(post("/api/monitors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createMonitor_shouldReturnBadRequest_whenIntervalTooLarge() throws Exception {
        MonitorDto dto = new MonitorDto();
        dto.setName("Test");
        dto.setUrl("https://example.com");
        dto.setType("HTTP");
        dto.setIntervalSeconds(100000);

        mockMvc.perform(post("/api/monitors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createMonitor_shouldAcceptLowercaseType() throws Exception {
        MonitorDto dto = new MonitorDto();
        dto.setName("Test Monitor");
        dto.setUrl("https://lowercase-test.com");
        dto.setType("http");
        dto.setIntervalSeconds(60);

        mockMvc.perform(post("/api/monitors")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("HTTP"));
    }

    @Test
    void getMonitorById_shouldReturnMonitor_whenExists() throws Exception {
        Monitor monitor = new Monitor();
        monitor.setName("Find Me");
        monitor.setUrl("https://findme.com");
        monitor.setType("HTTP");
        monitor.setIntervalSeconds(60);
        monitor = monitorRepository.save(monitor);

        mockMvc.perform(get("/api/monitors/{id}", monitor.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(monitor.getId().toString()))
                .andExpect(jsonPath("$.name").value("Find Me"));
    }

    @Test
    void getMonitorById_shouldReturnNotFound_whenNotExists() throws Exception {
        mockMvc.perform(get("/api/monitors/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteMonitor_shouldReturnNoContent_whenExists() throws Exception {
        Monitor monitor = new Monitor();
        monitor.setName("Delete Me");
        monitor.setUrl("https://deleteme.com");
        monitor.setType("HTTP");
        monitor.setIntervalSeconds(60);
        monitor = monitorRepository.save(monitor);

        mockMvc.perform(delete("/api/monitors/{id}", monitor.getId()))
                .andExpect(status().isNoContent());

        assertFalse(monitorRepository.existsById(monitor.getId()), "Monitor should be deleted");
    }

    @Test
    void deleteMonitor_shouldReturnNotFound_whenNotExists() throws Exception {
        mockMvc.perform(delete("/api/monitors/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllMonitors_shouldReturnAllMonitors() throws Exception {
        Monitor m1 = new Monitor();
        m1.setName("Monitor 1");
        m1.setUrl("https://monitor1.com");
        m1.setType("HTTP");
        m1.setIntervalSeconds(60);
        monitorRepository.save(m1);

        Monitor m2 = new Monitor();
        m2.setName("Monitor 2");
        m2.setUrl("https://monitor2.com");
        m2.setType("HTTPS");
        m2.setIntervalSeconds(30);
        monitorRepository.save(m2);

        mockMvc.perform(get("/api/monitors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void createMonitor_shouldSupportAllTypes() throws Exception {
        String[] types = { "HTTP", "HTTPS", "TCP", "PING" };

        for (String type : types) {
            MonitorDto dto = new MonitorDto();
            dto.setName(type + " Monitor");
            dto.setUrl("https://" + type.toLowerCase() + "-test.com");
            dto.setType(type);
            dto.setIntervalSeconds(60);

            mockMvc.perform(post("/api/monitors")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.type").value(type));
        }
    }
}
