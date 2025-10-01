const { Monitor } = require('../models/Monitor');
const { MonitorCheck } = require('../models/MonitorCheck');

class MonitorService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Validates monitor data
   * @param {Object} monitorData - Monitor configuration
   * @throws {Error} If validation fails
   */
  validateMonitorData(monitorData) {
    if (!monitorData.name || typeof monitorData.name !== 'string') {
      throw new Error('Monitor name is required and must be a string');
    }
    if (!monitorData.url || typeof monitorData.url !== 'string') {
      throw new Error('Monitor URL is required and must be a string');
    }
    if (!monitorData.type || !['http', 'https', 'ping', 'tcp'].includes(monitorData.type)) {
      throw new Error('Monitor type must be http, https, ping, or tcp');
    }
  }

  /**
   * Creates a new monitor
   * @param {Object} monitorData - Monitor configuration
   * @returns {Monitor} Created monitor
   */
  async createMonitor(monitorData) {
    try {
      // Validate monitor data
      this.validateMonitorData(monitorData);

      // Check for duplicate names
      const existingMonitor = this.findMonitorByName(monitorData.name);
      if (existingMonitor) {
        throw new Error(`Monitor with name "${monitorData.name}" already exists`);
      }

      // Create monitor in database using static method
      const monitor = Monitor.create(this.db, monitorData);

      return monitor;
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
   * Gets a monitor by ID
   * @param {number} id - Monitor ID
   * @returns {Monitor|null} Monitor or null if not found
   */
  async getMonitorById(id) {
    try {
      return Monitor.findById(this.db, id);
    } catch (error) {
      throw new Error(`Failed to retrieve monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Updates an existing monitor
   * @param {number} id - Monitor ID
   * @param {Object} monitorData - Updated monitor data
   * @returns {Monitor} Updated monitor
   */
  async updateMonitor(id, monitorData) {
    try {
      // Validate monitor data if provided
      if (monitorData.name || monitorData.url || monitorData.type) {
        this.validateMonitorData({...monitorData, id});
      }

      const monitor = Monitor.update(this.db, id, monitorData);
      return monitor;
    } catch (error) {
      throw new Error(`Failed to update monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Deletes a monitor
   * @param {number} id - Monitor ID
   */
  async deleteMonitor(id) {
    try {
      Monitor.delete(this.db, id);
    } catch (error) {
      throw new Error(`Failed to delete monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Finds a monitor by name
   * @param {string} name - Monitor name
   * @returns {Monitor|null} Monitor or null if not found
   */
  findMonitorByName(name) {
    try {
      const monitors = Monitor.findAll(this.db);
      return monitors.find(monitor => monitor.name === name) || null;
    } catch (error) {
      throw new Error(`Failed to find monitor by name ${name}: ${error.message}`);
    }
  }

  /**
   * Gets monitors by type
   * @param {string} type - Monitor type
   * @returns {Monitor[]} Array of monitors
   */
  getMonitorsByType(type) {
    try {
      return Monitor.findByType(this.db, type);
    } catch (error) {
      throw new Error(`Failed to find monitors by type ${type}: ${error.message}`);
    }
  }

  /**
   * Gets monitor statistics
   * @param {number} id - Monitor ID
   * @returns {Object} Monitor statistics
   */
  async getMonitorStats(id) {
    try {
      return Monitor.getStats(this.db, id);
    } catch (error) {
      throw new Error(`Failed to get stats for monitor ${id}: ${error.message}`);
    }
  }

  /**
   * Gets monitors that need to be checked
   * @param {number} maxChecks - Maximum monitors to return
   * @returns {Monitor[]} Array of monitors needing checks
   */
  getMonitorsNeedingChecks(maxChecks = 100) {
    try {
      const monitors = Monitor.findAll(this.db);
      // For now, return all active monitors
      // In a real implementation, you'd check last check time vs interval
      return monitors.slice(0, maxChecks);
    } catch (error) {
      throw new Error(`Failed to get monitors needing checks: ${error.message}`);
    }
  }

  /**
   * Creates multiple monitors in batch
   * @param {Array} monitorsData - Array of monitor data objects
   * @returns {Object} Batch operation results
   */
  async createMonitorsBatch(monitorsData) {
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
}

module.exports = MonitorService;