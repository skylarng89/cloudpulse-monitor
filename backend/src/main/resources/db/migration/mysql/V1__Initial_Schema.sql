CREATE TABLE monitors (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    type VARCHAR(50) NOT NULL,
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    status VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT idx_unique_url_type UNIQUE(url, type)
);

CREATE TABLE monitor_checks (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    monitor_id CHAR(36) NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER NOT NULL,
    status_code INTEGER,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
);

CREATE INDEX idx_monitor_checks_monitor_id ON monitor_checks(monitor_id);

CREATE TABLE idempotency_keys (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    operation_type VARCHAR(100) NOT NULL,
    response_body TEXT NOT NULL,
    response_status INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
