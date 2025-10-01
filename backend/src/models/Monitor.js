const Database = require('better-sqlite3');

/**
 * Monitor Model Class
 * Handles monitor data validation and database operations
 */
class Monitor {
  /**
   * Creates a new Monitor instance
   * @param {Object} data - Monitor data
   * @param {string} data.name - Monitor name
   * @param {string} data.url - URL to monitor
   * @param {string} data.type - Monitor type (http, ping, tcp)
   * @param {number} data.interval - Check interval in seconds
   * @param {boolean} data.active - Whether monitor is active
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.url = data.url || '';
    this.type = data.type || 'http';
    this.interval = data.interval || 60;
    this.active = data.active !== undefined ? data.active : true;
    this.created_at = data.created_at || new Date().toISOString();

    // Validate data on creation
    this.validate();
  }

  /**
   * Validates monitor data
   * @throws {Error} If validation fails
   */
  validate() {
    const errors = [];

    // Name validation
    if (!this.name || typeof this.name !== 'string' || this.name.trim().length === 0) {
      errors.push('Monitor name is required and must be a non-empty string');
    } else if (this.name.length > 100) {
      errors.push('Monitor name must be less than 100 characters');
    }

    // URL validation
    if (!this.url || typeof this.url !== 'string') {
      errors.push('Monitor URL is required and must be a string');
    } else {
      try {
        const url = new URL(this.url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('Monitor URL must use HTTP or HTTPS protocol');
        }
      } catch (error) {
        errors.push('Monitor URL must be a valid URL');
      }
    }

    // Type validation
    const validTypes = ['http', 'ping', 'tcp'];
    if (!validTypes.includes(this.type)) {
      errors.push(`Monitor type must be one of: ${validTypes.join(', ')}`);
    }

    // Interval validation
    if (typeof this.interval !== 'number' || this.interval < 30 || this.interval > 3600) {
      errors.push('Monitor interval must be a number between 30 and 3600 seconds');
    }

    // Active validation
    if (typeof this.active !== 'boolean') {
      errors.push('Monitor active status must be a boolean');
    }

    if (errors.length > 0) {
      throw new Error(`Monitor validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Saves the monitor to database
   * @param {Database} db - SQLite database instance
   * @returns {number} Inserted monitor ID
   */
  save(db) {
    try {
      const stmt = db.prepare(`
        INSERT INTO monitors (name, url, type, interval, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        this.name,
        this.url,
        this.type,
        this.interval,
        this.active ? 1 : 0,
        this.created_at
      );

      this.id = result.lastInsertRowid;
      return this.id;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('A monitor with this name already exists');
      }
      throw new Error(`Failed to save monitor: ${error.message}`);
    }
  }

  /**
   * Updates the monitor in database
   * @param {Database} db - SQLite database instance
   * @returns {boolean} Success status
   */
  update(db) {
    if (!this.id) {
      throw new Error('Cannot update monitor without ID');
    }

    try {
      const stmt = db.prepare(`
        UPDATE monitors
        SET name = ?, url = ?, type = ?, interval = ?, active = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        this.name,
        this.url,
        this.type,
        this.interval,
        this.active ? 1 : 0,
        this.id
      );

      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to update monitor: ${error.message}`);
    }
  }

  /**
   * Deletes the monitor from database
   * @param {Database} db - SQLite database instance
   * @returns {boolean} Success status
   */
  delete(db) {
    if (!this.id) {
      throw new Error('Cannot delete monitor without ID');
    }

    try {
      // Soft delete by setting active to false
      const stmt = db.prepare('UPDATE monitors SET active = 0 WHERE id = ?');
      const result = stmt.run(this.id);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete monitor: ${error.message}`);
    }
  }

  /**
   * Creates a Monitor instance from database row
   * @param {Object} row - Database row
   * @returns {Monitor} Monitor instance
   */
  static fromRow(row) {
    return new Monitor({
      id: row.id,
      name: row.name,
      url: row.url,
      type: row.type,
      interval: row.interval,
      active: row.active === 1,
      created_at: row.created_at
    });
  }

  /**
   * Finds all active monitors
   * @param {Database} db - SQLite database instance
   * @returns {Monitor[]} Array of monitor instances
   */
  static findAll(db) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors WHERE active = 1 ORDER BY created_at DESC');
      const rows = stmt.all();
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find monitors: ${error.message}`);
    }
  }

  /**
   * Finds a monitor by ID
   * @param {Database} db - SQLite database instance
   * @param {number} id - Monitor ID
   * @returns {Monitor|null} Monitor instance or null if not found
   */
  static findById(db, id) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors WHERE id = ? AND active = 1');
      const row = stmt.get(id);

      if (!row) {
        return null;
      }

      return this.fromRow(row);
    } catch (error) {
      throw new Error(`Failed to find monitor: ${error.message}`);
    }
  }

  /**
   * Finds monitors by type
   * @param {Database} db - SQLite database instance
   * @param {string} type - Monitor type
   * @returns {Monitor[]} Array of monitor instances
   */
  static findByType(db, type) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors WHERE type = ? AND active = 1 ORDER BY created_at DESC');
      const rows = stmt.all(type);
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find monitors by type: ${error.message}`);
    }
  }

  /**
   * Gets monitor statistics
   * @param {Database} db - SQLite database instance
   * @returns {Object} Statistics object
   */
  static getStats(db) {
    try {
      const stmt = db.prepare(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN type = 'http' THEN 1 END) as http_count,
          COUNT(CASE WHEN type = 'ping' THEN 1 END) as ping_count,
          COUNT(CASE WHEN type = 'tcp' THEN 1 END) as tcp_count,
          AVG(interval) as avg_interval
        FROM monitors
        WHERE active = 1
      `);

      return stmt.get();
    } catch (error) {
      throw new Error(`Failed to get monitor stats: ${error.message}`);
    }
  }
}

module.exports = Monitor;