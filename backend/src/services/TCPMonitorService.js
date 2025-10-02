const net = require('net');
const { MonitorCheck } = require('../models');

/**
 * TCP Monitor Service
 * Handles TCP port monitoring for services
 */
class TCPMonitorService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Performs a TCP port check on a monitor
   * @param {Object} monitor - Monitor configuration
   * @param {number} monitor.id - Monitor ID
   * @param {string} monitor.url - Host:Port to check (e.g., example.com:3306)
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
      // Parse host and port from URL
      const { host, port } = this.parseHostPort(monitor.url);

      // Perform TCP connection check
      const connectionResult = await this.checkTCPConnection(host, port);

      const responseTime = Date.now() - startTime;

      if (connectionResult.success) {
        checkResult.status = 'up';
        checkResult.response_time = responseTime;
        checkResult.status_code = port; // Store port as status_code for reference
      } else {
        checkResult.status = 'down';
        checkResult.response_time = responseTime;
        checkResult.error_message = connectionResult.error || 'Connection refused';
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;

      checkResult.response_time = responseTime;
      checkResult.status = 'error';
      checkResult.error_message = error.message || 'TCP check failed';
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
      console.error(`Failed to save TCP check result for monitor ${monitor.id}:`, dbError.message);
    }

    return checkResult;
  }

  /**
   * Checks if a TCP connection can be established
   * @param {string} host - Hostname or IP
   * @param {number} port - Port number
   * @returns {Promise<Object>} Connection result
   */
  checkTCPConnection(host, port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 10000; // 10 second timeout

      // Set timeout
      socket.setTimeout(timeout);

      socket.on('connect', () => {
        socket.destroy();
        resolve({ success: true });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ success: false, error: 'Connection timeout' });
      });

      socket.on('error', (error) => {
        socket.destroy();
        resolve({ 
          success: false, 
          error: error.code === 'ECONNREFUSED' ? 'Connection refused' : error.message 
        });
      });

      // Attempt connection
      socket.connect(port, host);
    });
  }

  /**
   * Parses host:port from URL string
   * @param {string} url - URL in format host:port
   * @returns {Object} { host, port }
   * @throws {Error} If format is invalid
   */
  parseHostPort(url) {
    // Remove protocol if present
    let hostPort = url.replace(/^(tcp:\/\/|https?:\/\/)/, '');

    // Split by colon
    const parts = hostPort.split(':');

    if (parts.length !== 2) {
      throw new Error('TCP monitor URL must be in format host:port');
    }

    const host = parts[0].trim();
    const port = parseInt(parts[1].trim());

    if (!host) {
      throw new Error('Host is required');
    }

    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('Port must be a number between 1 and 65535');
    }

    return { host, port };
  }

  /**
   * Validates if a host:port is suitable for TCP monitoring
   * @param {string} hostPort - Host:port to validate
   * @returns {boolean} True if valid
   * @throws {Error} If invalid
   */
  validateHostPort(hostPort) {
    if (!hostPort || typeof hostPort !== 'string' || hostPort.trim().length === 0) {
      throw new Error('Host:port is required for TCP monitoring');
    }

    // Try to parse it
    try {
      const { host, port } = this.parseHostPort(hostPort);
      
      // Validate host format (hostname or IP)
      const hostRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$|^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      
      if (!hostRegex.test(host)) {
        throw new Error('Host must be a valid hostname or IP address');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TCPMonitorService;
