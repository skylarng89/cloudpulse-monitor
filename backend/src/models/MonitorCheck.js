/**
 * MonitorCheck Model Class
 * Handles monitoring check results and database operations
 */
class MonitorCheck {
  /**
   * Creates a new MonitorCheck instance
   * @param {Object} data - Check result data
   * @param {number} data.monitor_id - Associated monitor ID
   * @param {string} data.status - Check status (up, down, error)
   * @param {number} data.response_time - Response time in milliseconds
   * @param {number} data.status_code - HTTP status code (for HTTP checks)
   * @param {string} data.error_message - Error message if check failed
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.monitor_id = data.monitor_id || null;
    this.status = data.status || 'unknown';
    this.response_time = data.response_time || null;
    this.status_code = data.status_code || null;
    this.error_message = data.error_message || null;
    this.checked_at = data.checked_at || new Date().toISOString();

    // Validate data on creation
    this.validate();
  }

  /**
   * Validates check result data
   * @throws {Error} If validation fails
   */
  validate() {
    const errors = [];

    // Monitor ID validation
    if (!this.monitor_id || typeof this.monitor_id !== 'number') {
      errors.push('Monitor ID is required and must be a number');
    }

    // Status validation
    const validStatuses = ['up', 'down', 'error', 'unknown'];
    if (!validStatuses.includes(this.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Response time validation (if provided)
    if (this.response_time !== null && (typeof this.response_time !== 'number' || this.response_time < 0)) {
      errors.push('Response time must be a positive number or null');
    }

    // Status code validation (if provided)
    if (this.status_code !== null && (typeof this.status_code !== 'number' || this.status_code < 100 || this.status_code > 599)) {
      errors.push('Status code must be a valid HTTP status code (100-599) or null');
    }

    if (errors.length > 0) {
      throw new Error(`Monitor check validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Saves the check result to database
   * @param {Database} db - SQLite database instance
   * @returns {number} Inserted check ID
   */
  save(db) {
    try {
      const stmt = db.prepare(`
        INSERT INTO monitor_checks (monitor_id, status, response_time, status_code, error_message, checked_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        this.monitor_id,
        this.status,
        this.response_time,
        this.status_code,
        this.error_message,
        this.checked_at
      );

      this.id = result.lastInsertRowid;
      return this.id;
    } catch (error) {
      throw new Error(`Failed to save monitor check: ${error.message}`);
    }
  }

  /**
   * Creates a MonitorCheck instance from database row
   * @param {Object} row - Database row
   * @returns {MonitorCheck} MonitorCheck instance
   */
  static fromRow(row) {
    return new MonitorCheck({
      id: row.id,
      monitor_id: row.monitor_id,
      status: row.status,
      response_time: row.response_time,
      status_code: row.status_code,
      error_message: row.error_message,
      checked_at: row.checked_at
    });
  }

  /**
   * Finds recent checks for a specific monitor
   * @param {Database} db - SQLite database instance
   * @param {number} monitorId - Monitor ID
   * @param {number} limit - Maximum number of results (default: 100)
   * @returns {MonitorCheck[]} Array of check instances
   */
  static findByMonitorId(db, monitorId, limit = 100) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM monitor_checks
        WHERE monitor_id = ?
        ORDER BY checked_at DESC
        LIMIT ?
      `);

      const rows = stmt.all(monitorId, limit);
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find monitor checks: ${error.message}`);
    }
  }

  /**
   * Finds recent checks across all monitors
   * @param {Database} db - SQLite database instance
   * @param {number} limit - Maximum number of results (default: 500)
   * @returns {MonitorCheck[]} Array of check instances
   */
  static findRecent(db, limit = 500) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM monitor_checks
        ORDER BY checked_at DESC
        LIMIT ?
      `);

      const rows = stmt.all(limit);
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find recent checks: ${error.message}`);
    }
  }

  /**
   * Gets check statistics for a monitor
   * @param {Database} db - SQLite database instance
   * @param {number} monitorId - Monitor ID
   * @param {number} hours - Hours to look back (default: 24)
   * @returns {Object} Statistics object
   */
  static getStatsForMonitor(db, monitorId, hours = 24) {
    try {
      const stmt = db.prepare(`
        SELECT
          COUNT(*) as total_checks,
          COUNT(CASE WHEN status = 'up' THEN 1 END) as up_checks,
          COUNT(CASE WHEN status = 'down' THEN 1 END) as down_checks,
          AVG(response_time) as avg_response_time,
          MIN(response_time) as min_response_time,
          MAX(response_time) as max_response_time
        FROM monitor_checks
        WHERE monitor_id = ?
        AND checked_at >= datetime('now', '-${hours} hours')
      `);

      return stmt.get(monitorId);
    } catch (error) {
      throw new Error(`Failed to get check stats: ${error.message}`);
    }
  }

  /**
   * Gets overall system statistics
   * @param {Database} db - SQLite database instance
   * @param {number} hours - Hours to look back (default: 24)
   * @returns {Object} System statistics
   */
  static getSystemStats(db, hours = 24) {
    try {
      const stmt = db.prepare(`
        SELECT
          COUNT(*) as total_checks,
          COUNT(CASE WHEN status = 'up' THEN 1 END) as up_checks,
          COUNT(CASE WHEN status = 'down' THEN 1 END) as down_checks,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as error_checks,
          AVG(response_time) as avg_response_time,
          MIN(response_time) as min_response_time,
          MAX(response_time) as max_response_time
        FROM monitor_checks
        WHERE checked_at >= datetime('now', '-${hours} hours')
      `);

      return stmt.get();
    } catch (error) {
      throw new Error(`Failed to get system stats: ${error.message}`);
    }
  }

  /**
   * Cleans up old check records (older than specified days)
   * @param {Database} db - SQLite database instance
   * @param {number} days - Days to keep (default: 30)
   * @returns {number} Number of records deleted
   */
  static cleanupOldRecords(db, days = 30) {
    try {
      const stmt = db.prepare(`
        DELETE FROM monitor_checks
        WHERE checked_at < datetime('now', '-${days} days')
      `);

      const result = stmt.run();
      return result.changes;
    } catch (error) {
      throw new Error(`Failed to cleanup old records: ${error.message}`);
    }
  }
}

module.exports = MonitorCheck;