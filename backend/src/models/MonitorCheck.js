/**
 * MonitorCheck Model Class
 * Handles monitoring check results and database operations
 */
class MonitorCheck {
  constructor(data) {
    this.id = data.id;
    this.monitor_id = data.monitor_id;
    this.status_code = data.status_code;
    this.response_time_ms = data.response_time_ms;
    this.is_up = data.is_up;
    this.error_message = data.error_message;
    this.checked_at = data.checked_at;
  }

  /**
   * Creates a MonitorCheck instance from a database row
   * @param {Object} row - Database row
   * @returns {MonitorCheck} MonitorCheck instance
   */
  static fromRow(row) {
    return new MonitorCheck({
      id: row.id,
      monitor_id: row.monitor_id,
      status_code: row.status_code,
      response_time_ms: row.response_time_ms,
      is_up: row.is_up,
      error_message: row.error_message,
      checked_at: row.checked_at
    });
  }

  /**
   * Finds all checks for a specific monitor
   * @param {Database} db - Database instance
   * @param {number} monitorId - Monitor ID
   * @param {number} limit - Maximum number of records to return
   * @returns {Array<MonitorCheck>} Array of monitor checks
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
      throw new Error(`Failed to find checks for monitor ${monitorId}: ${error.message}`);
    }
  }

  /**
   * Creates a new monitor check record
   * @param {Database} db - Database instance
   * @param {Object} checkData - Check result data
   * @returns {MonitorCheck} Created monitor check
   */
  static create(db, checkData) {
    try {
      const stmt = db.prepare(`
        INSERT INTO monitor_checks (monitor_id, status_code, response_time_ms, is_up, error_message)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        checkData.monitor_id,
        checkData.status_code || 200,
        checkData.response_time_ms || 0,
        checkData.is_up ? 1 : 0,
        checkData.error_message || null
      );

      return this.findById(db, result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create monitor check: ${error.message}`);
    }
  }

  /**
   * Finds a monitor check by ID
   * @param {Database} db - Database instance
   * @param {number} id - Check ID
   * @returns {MonitorCheck|null} MonitorCheck instance or null
   */
  static findById(db, id) {
    try {
      const stmt = db.prepare('SELECT * FROM monitor_checks WHERE id = ?');
      const row = stmt.get(id);
      return row ? this.fromRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to find monitor check ${id}: ${error.message}`);
    }
  }

  /**
   * Gets recent checks across all monitors
   * @param {Database} db - Database instance
   * @param {number} limit - Maximum number of records to return
   * @returns {Array<MonitorCheck>} Array of recent monitor checks
   */
  static getRecentChecks(db, limit = 50) {
    try {
      const stmt = db.prepare(`
        SELECT * FROM monitor_checks
        ORDER BY checked_at DESC
        LIMIT ?
      `);
      const rows = stmt.all(limit);
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to get recent checks: ${error.message}`);
    }
  }

  /**
   * Gets system statistics
   * @param {Database} db - Database instance
   * @param {number} hours - Number of hours to look back
   * @returns {Object} System statistics
   */
  static getSystemStats(db, hours = 24) {
    try {
      const stmt = db.prepare(`
        SELECT
          COUNT(*) as total_checks,
          AVG(response_time_ms) as avg_response_time,
          COUNT(CASE WHEN is_up = 1 THEN 1 END) as successful_checks,
          COUNT(CASE WHEN is_up = 0 THEN 1 END) as failed_checks,
          MIN(checked_at) as first_check,
          MAX(checked_at) as last_check
        FROM monitor_checks
        WHERE checked_at >= datetime('now', '-${hours} hours')
      `);

      const stats = stmt.get();

      return {
        total_checks: stats.total_checks || 0,
        avg_response_time: Math.round(stats.avg_response_time || 0),
        successful_checks: stats.successful_checks || 0,
        failed_checks: stats.failed_checks || 0,
        success_rate: stats.total_checks > 0 ? (stats.successful_checks / stats.total_checks * 100) : 0,
        uptime_percentage: stats.total_checks > 0 ? (stats.successful_checks / stats.total_checks * 100) : 100,
        first_check: stats.first_check,
        last_check: stats.last_check,
        time_range_hours: hours
      };
    } catch (error) {
      throw new Error(`Failed to get system statistics: ${error.message}`);
    }
  }

  /**
   * Cleans up old check records
   * @param {Database} db - Database instance
   * @param {number} daysToKeep - Number of days of data to keep
   * @returns {number} Number of records deleted
   */
  static cleanupOldRecords(db, daysToKeep = 30) {
    try {
      const stmt = db.prepare(`
        DELETE FROM monitor_checks
        WHERE checked_at < datetime('now', '-${daysToKeep} days')
      `);

      const result = stmt.run();
      return result.changes;
    } catch (error) {
      throw new Error(`Failed to cleanup old records: ${error.message}`);
    }
  }
}

module.exports = MonitorCheck;