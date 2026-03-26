package com.cloudpulse.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class MonitorDto {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "URL cannot be blank")
    private String url;

    @NotBlank(message = "Type cannot be blank")
    @Pattern(regexp = "^(?i)(HTTP|HTTPS|TCP|PING)$", message = "Type must be HTTP, HTTPS, TCP, or PING")
    private String type;

    @Min(value = 10, message = "Interval must be at least 10 seconds")
    @Max(value = 86400, message = "Interval cannot exceed 24 hours")
    private Integer intervalSeconds = 60;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getIntervalSeconds() { return intervalSeconds; }
    public void setIntervalSeconds(Integer intervalSeconds) { this.intervalSeconds = intervalSeconds; }
}
