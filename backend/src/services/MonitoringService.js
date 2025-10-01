const HTTPMonitorService = require('./HTTPMonitorService');
const PingMonitorService = require('./PingMonitorService');

/**
 * Unified Monitoring Service
 * Coordinates different types of monitoring checks
 */
class MonitoringService {
  constructor(db) {
    this.db = db;
    this.httpService = new HTTPMonitorService(db);
    this.pingService = new PingMonitorService(db);
  }

  /**
   * Performs a monitoring check based on monitor type
   * @param {Object} monitor - Monitor configuration
   * @returns {Object} Check result
   */
  async performCheck(monitor) {
    try {
      switch (monitor.type) {
        case 'http':
        case 'https':
          return await this.httpService.performCheck(monitor);

        case 'ping':
          return await this.pingService.performCheck(monitor);

        case 'tcp':
          // TCP checks would go here in the future
          throw new Error(`TCP monitoring not yet implemented for monitor: ${monitor.name}`);

        default:
          throw new Error(`Unknown monitor type: ${monitor.type}`);
      }
    } catch (error) {
      // Create error check result
      const errorResult = {
        monitor_id: monitor.id,
        status: 'error',
        response_time: null,
        status_code: null,
        error_message: error.message,
        checked_at: new Date().toISOString()
      };

      // Save error result to database
      try {
        const MonitorCheck = require('../models/MonitorCheck');
        const check = new MonitorCheck(errorResult);
        check.save(this.db);
      } catch (dbError) {
        console.error(`Failed to save error check result for monitor ${monitor.id}:`, dbError.message);
      }

      return errorResult;
    }
  }

  /**
   * Checks all active monitors
   * @param {Array} monitors - Array of monitor objects (optional, will fetch if not provided)
   * @returns {Array} Array of check results
   */
  async checkAllMonitors(monitors = null) {
    try {
      const Monitor = require('../models/Monitor');

      if (!monitors) {
        monitors = Monitor.findAll(this.db);
      }

      const results = [];

      for (const monitor of monitors) {
        try {
          const result = await this.performCheck(monitor);
          results.push(result);

          // Log result for debugging
          console.log(`Monitor ${monitor.name} (${monitor.type}): ${result.status} - ${result.response_time}ms`);

        } catch (error) {
          console.error(`Error checking monitor ${monitor.name}:`, error.message);

          // Create error result for logging
          results.push({
            monitor_id: monitor.id,
            status: 'error',
            response_time: null,
            status_code: null,
            error_message: error.message,
            checked_at: new Date().toISOString()
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to check all monitors: ${error.message}`);
    }
  }

  /**
   * Gets monitoring statistics
   * @param {number} hours - Hours to look back (default: 24)
   * @returns {Object} Monitoring statistics
   */
  async getMonitoringStats(hours = 24) {
    try {
      const MonitorCheck = require('../models/MonitorCheck');

      const stats = MonitorCheck.getSystemStats(this.db, hours);

      // Add HTTP-specific stats
      const httpStats = await this.httpService.getHTTPStats(hours);

      return {
        ...stats,
        http_stats: httpStats
      };
    } catch (error) {
      throw new Error(`Failed to get monitoring statistics: ${error.message}`);
    }
  }

  /**
   * Validates a monitor configuration
   * @param {Object} monitor - Monitor configuration
   * @returns {boolean} True if valid
   * @throws {Error} If invalid
   */
  validateMonitor(monitor) {
    try {
      switch (monitor.type) {
        case 'http':
        case 'https':
          return this.httpService.validateUrl(monitor.url);

        case 'ping':
          return this.pingService.validateHost(monitor.url);

        case 'tcp':
          // TCP validation would go here
          throw new Error('TCP validation not yet implemented');

        default:
          throw new Error(`Unknown monitor type: ${monitor.type}`);
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MonitoringService;