const { Monitor, MonitorCheck } = require('../models');

/**
 * Monitor Service Class
 * Handles business logic for monitor operations
 */
class MonitorService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Creates a new monitor
   * @param {Object} monitorData - Monitor data
   * @returns {Object} Created monitor with ID
   */
  async createMonitor(monitorData) {
    try {
      // Validate and create monitor instance
      const monitor = new Monitor(monitorData);

      // Check for duplicate names
      const existingMonitor = this.findMonitorByName(monitor.name);
      if (existingMonitor) {
        throw new Error(`Monitor with name "${monitor.name}" already exists`);
      }

      // Save to database
      const id = monitor.save(this.db);

      return {
        id,
        ...monitor,
        created_at: monitor.created_at
      };
    } catch (error) {
      throw new Error(`Failed to create monitor: ${error.message}`);
    }
  }

  /**
   * Gets all active monitors
   * @returns {Monitor[]} Array of monitors
   */
  async getAllMonitors() {
    try {
      return Monitor.findAll(this.db);
    } catch (error) {
      throw new Error(`Failed to retrieve monitors: ${error.message}`);
    }
  }

  /**
   * Gets monitors by type
   * @param {string} type - Monitor type (http, ping, tcp)
   * @returns {Monitor[]} Array of monitors
   */
  async getMonitorsByType(type) {
    try {
      const validTypes = ['http', 'ping', 'tcp'];
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid monitor type. Must be one of: ${validTypes.join(', ')}`);
      }

      return Monitor.findByType(this.db, type);
    } catch (error) {
      throw new Error(`Failed to retrieve monitors by type: ${error.message}`);
    }
  }

  /**
   * Gets a specific monitor by ID
   * @param {number} id - Monitor ID
   * @returns {Monitor|null} Monitor instance or null
   */
  async getMonitorById(id) {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error('Valid monitor ID is required');
      }

      return Monitor.findById(this.db, id);
    } catch (error) {
      throw new Error(`Failed to retrieve monitor: ${error.message}`);
    }
  }

  /**
   * Updates an existing monitor
   * @param {number} id - Monitor ID
   * @param {Object} updateData - Data to update
   * @returns {boolean} Success status
   */
  async updateMonitor(id, updateData) {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error('Valid monitor ID is required');
      }

      // Get existing monitor
      const existingMonitor = Monitor.findById(this.db, id);
      if (!existingMonitor) {
        throw new Error('Monitor not found');
      }

      // Check for name conflicts if name is being updated
      if (updateData.name && updateData.name !== existingMonitor.name) {
        const duplicateMonitor = this.findMonitorByName(updateData.name);
        if (duplicateMonitor) {
          throw new Error(`Monitor with name "${updateData.name}" already exists`);
        }
      }

      // Update monitor properties
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          existingMonitor[key] = updateData[key];
        }
      });

      // Validate updated data
      existingMonitor.validate();

      // Save to database
      return existingMonitor.update(this.db);
    } catch (error) {
      throw new Error(`Failed to update monitor: ${error.message}`);
    }
  }

  /**
   * Deletes a monitor (soft delete)
   * @param {number} id - Monitor ID
   * @returns {boolean} Success status
   */
  async deleteMonitor(id) {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error('Valid monitor ID is required');
      }

      const monitor = Monitor.findById(this.db, id);
      if (!monitor) {
        throw new Error('Monitor not found');
      }

      return monitor.delete(this.db);
    } catch (error) {
      throw new Error(`Failed to delete monitor: ${error.message}`);
    }
  }

  /**
   * Gets monitor statistics
   * @returns {Object} Statistics object
   */
  async getMonitorStats() {
    try {
      return Monitor.getStats(this.db);
    } catch (error) {
      throw new Error(`Failed to retrieve monitor statistics: ${error.message}`);
    }
  }

  /**
   * Gets recent check results for a monitor
   * @param {number} monitorId - Monitor ID
   * @param {number} limit - Maximum results (default: 50)
   * @returns {MonitorCheck[]} Array of check results
   */
  async getMonitorChecks(monitorId, limit = 50) {
    try {
      if (!monitorId || typeof monitorId !== 'number') {
        throw new Error('Valid monitor ID is required');
      }

      // Verify monitor exists
      const monitor = Monitor.findById(this.db, monitorId);
      if (!monitor) {
        throw new Error('Monitor not found');
      }

      return MonitorCheck.findByMonitorId(this.db, monitorId, limit);
    } catch (error) {
      throw new Error(`Failed to retrieve monitor checks: ${error.message}`);
    }
  }

  /**
   * Gets check statistics for a monitor
   * @param {number} monitorId - Monitor ID
   * @param {number} hours - Hours to look back (default: 24)
   * @returns {Object} Check statistics
   */
  async getMonitorCheckStats(monitorId, hours = 24) {
    try {
      if (!monitorId || typeof monitorId !== 'number') {
        throw new Error('Valid monitor ID is required');
      }

      // Verify monitor exists
      const monitor = Monitor.findById(this.db, monitorId);
      if (!monitor) {
        throw new Error('Monitor not found');
      }

      return MonitorCheck.getStatsForMonitor(this.db, monitorId, hours);
    } catch (error) {
      throw new Error(`Failed to retrieve monitor check statistics: ${error.message}`);
    }
  }

  /**
   * Gets system-wide check statistics
   * @param {number} hours - Hours to look back (default: 24)
   * @returns {Object} System statistics
   */
  async getSystemCheckStats(hours = 24) {
    try {
      return MonitorCheck.getSystemStats(this.db, hours);
    } catch (error) {
      throw new Error(`Failed to retrieve system check statistics: ${error.message}`);
    }
  }

  /**
   * Cleans up old check records
   * @param {number} days - Days to keep (default: 30)
   * @returns {number} Number of records deleted
   */
  async cleanupOldCheckRecords(days = 30) {
    try {
      return MonitorCheck.cleanupOldRecords(this.db, days);
    } catch (error) {
      throw new Error(`Failed to cleanup old records: ${error.message}`);
    }
  }

  /**
   * Validates monitor data (without creating instance)
   * @param {Object} monitorData - Monitor data to validate
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validateMonitorData(monitorData) {
    try {
      const monitor = new Monitor(monitorData);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds a monitor by name (internal method)
   * @param {string} name - Monitor name
   * @returns {Monitor|null} Monitor instance or null
   */
  findMonitorByName(name) {
    try {
      // This is a simple implementation - in production you might want a direct query
      const monitors = Monitor.findAll(this.db);
      return monitors.find(monitor => monitor.name.toLowerCase() === name.toLowerCase());
    } catch (error) {
      return null;
    }
  }

  /**
   * Bulk creates multiple monitors
   * @param {Array} monitorsData - Array of monitor data objects
   * @returns {Array} Array of created monitor objects
   */
  async bulkCreateMonitors(monitorsData) {
    const results = [];
    const errors = [];

    for (const monitorData of monitorsData) {
      try {
        const monitor = await this.createMonitor(monitorData);
        results.push(monitor);
      } catch (error) {
        errors.push({
          data: monitorData,
          error: error.message
        });
      }
    }

    return {
      created: results,
      errors,
      totalCreated: results.length,
      totalErrors: errors.length
    };
  }

  /**
   * Gets monitors that need to be checked (based on interval)
   * @param {number} maxChecks - Maximum monitors to return (default: 100)
   * @returns {Monitor[]} Array of monitors ready for checking
   */
  async getMonitorsForChecking(maxChecks = 100) {
    try {
      // This is a simplified implementation
      // In production, you'd want to check the last check time vs interval
      const monitors = Monitor.findAll(this.db);
      return monitors.slice(0, maxChecks);
    } catch (error) {
      throw new Error(`Failed to get monitors for checking: ${error.message}`);
    }
  }
}

module.exports = MonitorService;