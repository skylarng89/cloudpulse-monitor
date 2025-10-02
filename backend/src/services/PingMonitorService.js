const ping = require('ping');
const { MonitorCheck } = require('../models');

/**
 * Ping Monitor Service
 * Handles ping/connectivity monitoring for hosts
 */
class PingMonitorService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Performs a ping check on a monitor
   * @param {Object} monitor - Monitor configuration
   * @param {number} monitor.id - Monitor ID
   * @param {string} monitor.url - Host to ping (IP or hostname)
   * @returns {Object} Check result
   */
  async performCheck(monitor) {
    const startTime = Date.now();

    const checkResult = {
      monitor_id: monitor.id,
      status: 'unknown',
      response_time: null,
      status_code: null,
      error_message: null,
      checked_at: new Date().toISOString()
    };

    try {
      // Extract hostname from URL if needed
      let host = monitor.url;
      if (host.startsWith('http://') || host.startsWith('https://')) {
        const url = new URL(host);
        host = url.hostname;
      }

      // Perform ping check
      const pingResult = await ping.promise.probe(host, {
        timeout: 10,
        extra: ['-c', '1'] // Single packet
      });

      const responseTime = Date.now() - startTime;

      if (pingResult.alive) {
        checkResult.status = 'up';
        checkResult.response_time = Math.round(pingResult.time);
      } else {
        checkResult.status = 'down';
        checkResult.error_message = 'Host not reachable';
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;

      checkResult.response_time = responseTime;
      checkResult.status = 'error';
      checkResult.error_message = error.message || 'Ping check failed';
    }

    // Save check result to database
    try {
      // Map checkResult to database format
      const dbCheckData = {
        monitor_id: checkResult.monitor_id,
        status_code: checkResult.status_code,
        response_time_ms: checkResult.response_time,
        is_up: checkResult.status === 'up' ? 1 : 0,
        error_message: checkResult.error_message
      };
      
      MonitorCheck.create(this.db, dbCheckData);
    } catch (dbError) {
      console.error(`Failed to save ping check result for monitor ${monitor.id}:`, dbError.message);
    }

    return checkResult;
  }

  /**
   * Validates if a host is suitable for ping monitoring
   * @param {string} host - Host to validate
   * @returns {boolean} True if valid
   * @throws {Error} If invalid
   */
  validateHost(host) {
    if (!host || typeof host !== 'string' || host.trim().length === 0) {
      throw new Error('Host is required for ping monitoring');
    }

    // Basic hostname/IP validation
    const hostRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!hostRegex.test(host)) {
      throw new Error('Host must be a valid hostname or IP address');
    }

    return true;
  }
}

module.exports = PingMonitorService;