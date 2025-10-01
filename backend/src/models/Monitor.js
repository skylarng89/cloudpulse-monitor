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
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }

  /**
   * Finds all active monitors
   * @param {Database} db - Database instance
   * @returns {Array<Monitor>} Array of monitors
   */
  static findAll(db) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors WHERE is_active = 1 ORDER BY created_at DESC');
      const rows = stmt.all();
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find monitors: ${error.message}`);
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
   * Creates a new monitor
   * @param {Database} db - Database instance
   * @param {Object} monitorData - Monitor data
   * @returns {Monitor} Created monitor
   */
  static create(db, monitorData) {
    try {
      const stmt = db.prepare(`
        INSERT INTO monitors (name, url, type, interval_seconds, timeout_seconds, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        monitorData.name,
        monitorData.url,
        monitorData.type || 'http',
        monitorData.interval_seconds || 60,
        monitorData.timeout_seconds || 30,
        monitorData.is_active !== undefined ? monitorData.is_active : true
      );

      return this.findById(db, result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create monitor: ${error.message}`);
    }
  }

  /**
   * Updates an existing monitor
   * @param {Database} db - Database instance
   * @param {number} id - Monitor ID
   * @param {Object} monitorData - Updated monitor data
   * @returns {Monitor} Updated monitor
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
        values.push(monitorData.is_active);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = db.prepare(`
        UPDATE monitors SET ${updateFields.join(', ')} WHERE id = ?
      `);

      stmt.run(...values);
      return this.findById(db, id);
    } catch (error) {
      throw new Error(`Failed to update monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Deletes a monitor
   * @param {Database} db - Database instance
   * @param {number} id - Monitor ID
   */
  static delete(db, id) {
    try {
      const stmt = db.prepare('DELETE FROM monitors WHERE id = ?');
      stmt.run(id);
    } catch (error) {
      throw new Error(`Failed to delete monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Finds monitors by type
   * @param {Database} db - Database instance
   * @param {string} type - Monitor type (http, ping, tcp)
   * @returns {Array<Monitor>} Array of monitors
   */
  static findByType(db, type) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors WHERE type = ? AND is_active = 1 ORDER BY created_at DESC');
      const rows = stmt.all(type);
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find monitors by type ${type}: ${error.message}`);
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
      // Get recent checks for this monitor
      const checksStmt = db.prepare(`
        SELECT COUNT(*) as total_checks,
               AVG(response_time_ms) as avg_response_time,
               COUNT(CASE WHEN is_up = 1 THEN 1 END) as successful_checks,
               MAX(checked_at) as last_check
        FROM monitor_checks
        WHERE monitor_id = ?
        ORDER BY checked_at DESC
        LIMIT 100
      `);

      const stats = checksStmt.get(id) || {
        total_checks: 0,
        avg_response_time: 0,
        successful_checks: 0,
        last_check: null
      };

      return {
        total_checks: stats.total_checks,
        avg_response_time: Math.round(stats.avg_response_time || 0),
        success_rate: stats.total_checks > 0 ? (stats.successful_checks / stats.total_checks * 100) : 0,
        last_check: stats.last_check,
        uptime_percentage: stats.total_checks > 0 ? (stats.successful_checks / stats.total_checks * 100) : 100
      };
    } catch (error) {
      throw new Error(`Failed to get stats for monitor ${id}: ${error.message}`);
    }
  }
}

module.exports = Monitor;