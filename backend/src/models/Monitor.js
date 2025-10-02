const Database = require('better-sqlite3');

/**
 * Monitor Model Class
 * Handles database operations for monitors table
 */
class Monitor {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.url = data.url;
    this.type = data.type;
    this.interval_seconds = data.interval_seconds;
    this.timeout_seconds = data.timeout_seconds;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Creates the monitors table if it doesn't exist
   * @param {Database} db - Database instance
   */
  static createTable(db) {
    const sql = `
      CREATE TABLE IF NOT EXISTS monitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'http',
        interval_seconds INTEGER NOT NULL DEFAULT 60,
        timeout_seconds INTEGER NOT NULL DEFAULT 30,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.exec(sql);
  }

  /**
   * Creates a new monitor
   * @param {Database} db - Database instance
   * @param {Object} monitorData - Monitor data
   * @returns {Monitor} Created monitor instance
   */
  static create(db, monitorData) {
    try {
      const sql = `
        INSERT INTO monitors (name, url, type, interval_seconds, timeout_seconds, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const stmt = db.prepare(sql);
      const result = stmt.run(
        monitorData.name,
        monitorData.url,
        monitorData.type || 'http',
        monitorData.interval_seconds || 60,
        monitorData.timeout_seconds || 30,
        monitorData.is_active !== undefined ? (monitorData.is_active ? 1 : 0) : 1
      );

      // Return the created monitor
      return this.findById(db, result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create monitor: ${error.message}`);
    }
  }

  /**
   * Finds all monitors
   * @param {Database} db - Database instance
   * @returns {Monitor[]} Array of monitor instances
   */
  static findAll(db) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors ORDER BY name');
      const rows = stmt.all();
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find all monitors: ${error.message}`);
    }
  }

  /**
   * Finds a monitor by ID
   * @param {Database} db - Database instance
   * @param {number} id - Monitor ID
   * @returns {Monitor|null} Monitor instance or null
   */
  static findById(db, id) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors WHERE id = ?');
      const row = stmt.get(id);
      return row ? this.fromRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to find monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Finds monitors by type
   * @param {Database} db - Database instance
   * @param {string} type - Monitor type
   * @returns {Monitor[]} Array of monitor instances
   */
  static findByType(db, type) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors WHERE type = ? ORDER BY name');
      const rows = stmt.all(type);
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find monitors by type ${type}: ${error.message}`);
    }
  }

  /**
   * Updates a monitor
   * @param {Database} db - Database instance
   * @param {number} id - Monitor ID
   * @param {Object} monitorData - Updated monitor data
   * @returns {Monitor} Updated monitor instance
   */
  static update(db, id, monitorData) {
    try {
      const updateFields = [];
      const values = [];

      if (monitorData.name !== undefined) {
        updateFields.push('name = ?');
        values.push(monitorData.name);
      }
      if (monitorData.url !== undefined) {
        updateFields.push('url = ?');
        values.push(monitorData.url);
      }
      if (monitorData.type !== undefined) {
        updateFields.push('type = ?');
        values.push(monitorData.type);
      }
      if (monitorData.interval_seconds !== undefined) {
        updateFields.push('interval_seconds = ?');
        values.push(monitorData.interval_seconds);
      }
      if (monitorData.timeout_seconds !== undefined) {
        updateFields.push('timeout_seconds = ?');
        values.push(monitorData.timeout_seconds);
      }
      if (monitorData.is_active !== undefined) {
        updateFields.push('is_active = ?');
        values.push(monitorData.is_active ? 1 : 0);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const sql = `UPDATE monitors SET ${updateFields.join(', ')} WHERE id = ?`;
      const stmt = db.prepare(sql);
      stmt.run(...values);

      return this.findById(db, id);
    } catch (error) {
      throw new Error(`Failed to update monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Deletes a monitor and all related records
   * @param {Database} db - Database instance
   * @param {number} id - Monitor ID
   */
  static delete(db, id) {
    try {
      // Use a transaction to ensure atomic deletion
      const deleteTransaction = db.transaction(() => {
        // First, delete all related monitor checks
        const deleteChecks = db.prepare('DELETE FROM monitor_checks WHERE monitor_id = ?');
        deleteChecks.run(id);
        
        // Then, delete all related incidents
        const deleteIncidents = db.prepare('DELETE FROM incidents WHERE monitor_id = ?');
        deleteIncidents.run(id);
        
        // Finally, delete the monitor itself
        const deleteMonitor = db.prepare('DELETE FROM monitors WHERE id = ?');
        deleteMonitor.run(id);
      });
      
      // Execute the transaction
      deleteTransaction();
    } catch (error) {
      throw new Error(`Failed to delete monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Gets monitor statistics
   * @param {Database} db - Database instance
   * @param {number} id - Monitor ID
   * @returns {Object} Monitor statistics
   */
  static getStats(db, id) {
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
        WHERE monitor_id = ?
      `);

      const stats = stmt.get(id);

      return {
        monitor_id: id,
        total_checks: stats.total_checks || 0,
        avg_response_time: Math.round(stats.avg_response_time || 0),
        successful_checks: stats.successful_checks || 0,
        failed_checks: stats.failed_checks || 0,
        success_rate: stats.total_checks > 0 ? (stats.successful_checks / stats.total_checks * 100) : 0,
        uptime_percentage: stats.total_checks > 0 ? (stats.successful_checks / stats.total_checks * 100) : 100,
        first_check: stats.first_check,
        last_check: stats.last_check
      };
    } catch (error) {
      throw new Error(`Failed to get stats for monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Creates a Monitor instance from a database row
   * @param {Object} row - Database row
   * @returns {Monitor} Monitor instance
   */
  static fromRow(row) {
    return new Monitor({
      id: row.id,
      name: row.name,
      url: row.url,
      type: row.type,
      interval_seconds: row.interval_seconds,
      timeout_seconds: row.timeout_seconds,
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }

  /**
   * Converts monitor to plain object for API responses
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      type: this.type,
      interval_seconds: this.interval_seconds,
      timeout_seconds: this.timeout_seconds,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Monitor;