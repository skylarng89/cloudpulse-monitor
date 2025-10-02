const axios = require('axios');
const { MonitorCheck } = require('../models');

/**
 * HTTP Monitor Service
 * Handles HTTP monitoring checks for websites and APIs
 */
class HTTPMonitorService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Performs an HTTP check on a monitor
   * @param {Object} monitor - Monitor configuration
   * @param {number} monitor.id - Monitor ID
   * @param {string} monitor.url - URL to check
   * @param {number} monitor.interval - Check interval (not used in this method)
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
      // Configure request options
      const requestOptions = {
        url: monitor.url,
        method: 'GET',
        timeout: 30000, // 30 second timeout
        validateStatus: (status) => status < 500, // Consider 4xx as "up" but 5xx as "down"
        headers: {
          'User-Agent': 'CloudPulse-Monitor/1.0'
        }
      };

      // Perform HTTP request
      const response = await axios(requestOptions);

      const responseTime = Date.now() - startTime;

      // Determine status based on response
      if (response.status >= 200 && response.status < 400) {
        checkResult.status = 'up';
      } else if (response.status >= 400 && response.status < 500) {
        checkResult.status = 'up'; // Consider 4xx as up (client errors)
      } else {
        checkResult.status = 'down';
      }

      checkResult.response_time = responseTime;
      checkResult.status_code = response.status;

    } catch (error) {
      const responseTime = Date.now() - startTime;

      checkResult.response_time = responseTime;

      if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
        // DNS resolution failed
        checkResult.status = 'down';
        checkResult.error_message = 'DNS resolution failed';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
        // Connection refused or reset
        checkResult.status = 'down';
        checkResult.error_message = 'Connection refused';
      } else if (error.code === 'ETIMEDOUT') {
        // Request timeout
        checkResult.status = 'down';
        checkResult.error_message = 'Request timeout';
      } else if (error.response) {
        // Server responded with error status
        checkResult.status = 'down';
        checkResult.status_code = error.response.status;
        checkResult.error_message = `HTTP ${error.response.status}: ${error.response.statusText}`;
      } else {
        // Other error
        checkResult.status = 'error';
        checkResult.error_message = error.message || 'Unknown error';
      }
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
      console.error(`Failed to save check result for monitor ${monitor.id}:`, dbError.message);
    }

    return checkResult;
  }

  /**
   * Checks multiple monitors concurrently
   * @param {Array} monitors - Array of monitor objects
   * @param {number} concurrency - Maximum concurrent checks (default: 10)
   * @returns {Array} Array of check results
   */
  async checkMultipleMonitors(monitors, concurrency = 10) {
    const results = [];

    // Process monitors in batches to control concurrency
    for (let i = 0; i < monitors.length; i += concurrency) {
      const batch = monitors.slice(i, i + concurrency);

      const batchPromises = batch.map(monitor => this.performCheck(monitor));
      const batchResults = await Promise.all(batchPromises);

      results.push(...batchResults);

      // Small delay between batches to be respectful
      if (i + concurrency < monitors.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Validates if a URL is suitable for HTTP monitoring
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   * @throws {Error} If invalid
   */
  validateUrl(url) {
    try {
      const parsedUrl = new URL(url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }

      if (!parsedUrl.hostname) {
        throw new Error('URL must include a hostname');
      }

      return true;
    } catch (error) {
      if (error.message.includes('URL')) {
        throw error;
      }
      throw new Error('Invalid URL format');
    }
  }

  /**
   * Gets HTTP-specific statistics for monitors
   * @param {number} hours - Hours to look back (default: 24)
   * @returns {Object} HTTP statistics
   */
  async getHTTPStats(hours = 24) {
    try {
      const stmt = this.db.prepare(`
        SELECT
          COUNT(*) as total_checks,
          COUNT(CASE WHEN status = 'up' THEN 1 END) as up_checks,
          COUNT(CASE WHEN status = 'down' THEN 1 END) as down_checks,
          AVG(response_time) as avg_response_time,
          MIN(response_time) as min_response_time,
          MAX(response_time) as max_response_time,
          AVG(CASE WHEN status_code >= 200 AND status_code < 300 THEN response_time END) as avg_success_response_time
        FROM monitor_checks
        WHERE checked_at >= datetime('now', '-${hours} hours')
      `);

      return stmt.get();
    } catch (error) {
      throw new Error(`Failed to get HTTP statistics: ${error.message}`);
    }
  }

  /**
   * Gets response time distribution for analysis
   * @param {number} hours - Hours to look back (default: 24)
   * @returns {Array} Response time buckets
   */
  async getResponseTimeDistribution(hours = 24) {
    try {
      const stmt = this.db.prepare(`
        SELECT
          CASE
            WHEN response_time < 100 THEN '0-100ms'
            WHEN response_time < 500 THEN '100-500ms'
            WHEN response_time < 1000 THEN '500-1000ms'
            WHEN response_time < 2000 THEN '1-2s'
            WHEN response_time < 5000 THEN '2-5s'
            ELSE '5s+'
          END as response_bucket,
          COUNT(*) as count
        FROM monitor_checks
        WHERE response_time IS NOT NULL
        AND checked_at >= datetime('now', '-${hours} hours')
        GROUP BY response_bucket
        ORDER BY MIN(response_time)
      `);

      return stmt.all();
    } catch (error) {
      throw new Error(`Failed to get response time distribution: ${error.message}`);
    }
  }
}

module.exports = HTTPMonitorService;