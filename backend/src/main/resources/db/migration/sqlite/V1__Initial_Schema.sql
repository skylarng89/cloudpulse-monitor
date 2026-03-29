CREATE TABLE monitors (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'UNKNOWN',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_unique_url_type ON monitors(url, type);

CREATE TABLE monitor_checks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    monitor_id TEXT NOT NULL,
    checked_at TEXT DEFAULT (datetime('now')),
    response_time_ms INTEGER NOT NULL,
    status_code INTEGER,
    status TEXT NOT NULL,
    error_message TEXT,
    FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
);

CREATE INDEX idx_monitor_checks_monitor_id ON monitor_checks(monitor_id);

CREATE TABLE idempotency_keys (
    idempotency_key TEXT PRIMARY KEY,
    operation_type TEXT NOT NULL,
    response_body TEXT NOT NULL,
    response_status INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
