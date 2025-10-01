const cron = require('node-cron');
const { MonitoringService } = require('./MonitoringService');

/**
 * Scheduler Service
 * Manages automated monitoring schedules and cron jobs
 */
class SchedulerService {
  constructor(db) {
    this.db = db;
    this.monitoringService = new MonitoringService(db);
    this.scheduledJobs = new Map(); // Track active cron jobs
    this.isRunning = false;
    this.stats = {
      totalChecks: 0,
      lastRun: null,
      errors: 0,
      monitorsChecked: 0
    };
  }

  /**
   * Starts the scheduler and begins monitoring
   */
  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting CloudPulse Monitor Scheduler');

    // Run every minute to check for monitors that need checking
    const job = cron.schedule('* * * * *', () => {
      this.runScheduledChecks();
    }, {
      scheduled: false // Don't start automatically
    });

    this.scheduledJobs.set('main-scheduler', job);
    job.start();

    console.log('✅ Scheduler started - monitoring every minute');
  }

  /**
   * Stops the scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('🛑 Stopping CloudPulse Monitor Scheduler');

    // Stop all scheduled jobs
    for (const [name, job] of this.scheduledJobs) {
      job.stop();
      console.log(`Stopped job: ${name}`);
    }

    this.scheduledJobs.clear();
    this.isRunning = false;

    console.log('✅ Scheduler stopped');
  }

  /**
   * Runs scheduled checks for monitors that need them
   */
  async runScheduledChecks() {
    try {
      const Monitor = require('../models/Monitor');
      const monitors = Monitor.findAll(this.db);

      if (monitors.length === 0) {
        return; // No monitors to check
      }

      const monitorsToCheck = this.getMonitorsNeedingCheck(monitors);

      if (monitorsToCheck.length === 0) {
        return; // No monitors need checking right now
      }

      console.log(`📊 Running scheduled checks for ${monitorsToCheck.length} monitors`);

      const results = await this.monitoringService.checkMultipleMonitors(monitorsToCheck, 5); // 5 concurrent checks

      // Update statistics
      this.stats.totalChecks += results.length;
      this.stats.lastRun = new Date();
      this.stats.monitorsChecked += monitorsToCheck.length;

      // Log results summary
      const successCount = results.filter(r => r.status === 'up').length;
      const downCount = results.filter(r => r.status === 'down').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      console.log(`✅ Check complete: ${successCount} up, ${downCount} down, ${errorCount} errors`);

      // Log slow responses for attention
      const slowResponses = results.filter(r => r.response_time > 5000);
      if (slowResponses.length > 0) {
        console.log(`⚠️  Slow responses detected: ${slowResponses.length} monitors > 5s`);
      }

    } catch (error) {
      console.error('❌ Error in scheduled checks:', error.message);
      this.stats.errors++;
    }
  }

  /**
   * Determines which monitors need to be checked based on their intervals
   * @param {Array} monitors - Array of monitor objects
   * @returns {Array} Monitors that need checking
   */
  getMonitorsNeedingCheck(monitors) {
    const now = Date.now();
    const monitorsToCheck = [];

    for (const monitor of monitors) {
      // For now, check all monitors every minute (simple approach)
      // In production, you'd track last check time and compare with interval
      if (this.shouldCheckMonitor(monitor, now)) {
        monitorsToCheck.push(monitor);
      }
    }

    return monitorsToCheck;
  }

  /**
   * Determines if a monitor should be checked now
   * @param {Object} monitor - Monitor object
   * @param {number} now - Current timestamp
   * @returns {boolean} True if monitor should be checked
   */
  shouldCheckMonitor(monitor, now) {
    // Simple implementation: check all monitors
    // In production, you'd implement proper interval tracking

    // For demo purposes, check monitors with intervals of 1 minute or less
    return monitor.interval <= 60;
  }

  /**
   * Manually triggers checks for all monitors (for testing)
   * @returns {Array} Check results
   */
  async triggerManualCheck() {
    console.log('🔄 Manual check triggered');

    const Monitor = require('../models/Monitor');
    const monitors = Monitor.findAll(this.db);

    if (monitors.length === 0) {
      return [];
    }

    const results = await this.monitoringService.checkMultipleMonitors(monitors, 10); // Higher concurrency for manual checks

    this.stats.totalChecks += results.length;
    this.stats.lastRun = new Date();
    this.stats.monitorsChecked += monitors.length;

    return results;
  }

  /**
   * Gets scheduler status and statistics
   * @returns {Object} Scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.scheduledJobs.size,
      stats: { ...this.stats },
      nextRun: this.getNextRunTime()
    };
  }

  /**
   * Estimates next run time (approximate)
   * @returns {Date} Next scheduled run time
   */
  getNextRunTime() {
    if (!this.isRunning) {
      return null;
    }

    // Since we run every minute, next run is approximately 1 minute from now
    return new Date(Date.now() + 60000);
  }

  /**
   * Restarts the scheduler (stop and start)
   */
  async restart() {
    console.log('🔄 Restarting scheduler');
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
    this.start();
  }

  /**
   * Gets monitoring schedule summary
   * @returns {Object} Schedule information
   */
  getScheduleInfo() {
    const Monitor = require('../models/Monitor');
    const monitors = Monitor.findAll(this.db);

    const scheduleSummary = {
      totalMonitors: monitors.length,
      byInterval: {},
      byType: {}
    };

    for (const monitor of monitors) {
      // Group by interval
      const intervalKey = `${monitor.interval}s`;
      if (!scheduleSummary.byInterval[intervalKey]) {
        scheduleSummary.byInterval[intervalKey] = 0;
      }
      scheduleSummary.byInterval[intervalKey]++;

      // Group by type
      if (!scheduleSummary.byType[monitor.type]) {
        scheduleSummary.byType[monitor.type] = 0;
      }
      scheduleSummary.byType[monitor.type]++;
    }

    return scheduleSummary;
  }
}

module.exports = SchedulerService;