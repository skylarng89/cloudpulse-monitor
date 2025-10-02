const cron = require('node-cron');
const Monitor = require('../models/Monitor');
const HTTPMonitorService = require('./HTTPMonitorService');

class SchedulerService {
  constructor(db) {
    this.db = db;
    this.scheduledJobs = new Map();
    this.isRunning = false;
    this.httpMonitorService = new HTTPMonitorService(db);
    this.stats = {
      totalChecks: 0,
      lastCheck: null,
      errors: 0
    };
  }

  async start() {
    if (this.isRunning) {
      throw new Error('Scheduler is already running');
    }

    try {
      this.isRunning = true;
      const monitors = Monitor.findAll(this.db);

      for (const monitor of monitors) {
        if (monitor.is_active) {
          this.scheduleMonitorCheck(monitor);
        }
      }

      console.log(`Scheduler started with ${monitors.length} monitors`);
      return { success: true, monitorsScheduled: monitors.length };
    } catch (error) {
      this.isRunning = false;
      throw new Error(`Failed to start scheduler: ${error.message}`);
    }
  }

  async stop() {
    if (!this.isRunning) {
      throw new Error('Scheduler is not running');
    }

    try {
      for (const [monitorId, job] of this.scheduledJobs) {
        job.stop();
      }
      this.scheduledJobs.clear();
      this.isRunning = false;

      console.log('Scheduler stopped');
      return { success: true, jobsStopped: this.scheduledJobs.size };
    } catch (error) {
      throw new Error(`Failed to stop scheduler: ${error.message}`);
    }
  }

  async restart() {
    try {
      await this.stop();
      await this.start();
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to restart scheduler: ${error.message}`);
    }
  }

  scheduleMonitorCheck(monitor) {
    try {
      const intervalSeconds = monitor.interval_seconds || 60;
      const cronExpression = `*/${Math.floor(intervalSeconds / 60)} * * * * *`;

      const job = cron.schedule(cronExpression, async () => {
        await this.runMonitorCheck(monitor.id);
      }, {
        scheduled: false
      });

      this.scheduledJobs.set(monitor.id, job);
      job.start();

      console.log(`Scheduled monitor ${monitor.id} (${monitor.name}) every ${intervalSeconds} seconds`);
    } catch (error) {
      console.error(`Failed to schedule monitor ${monitor.id}:`, error);
      throw error;
    }
  }

  unscheduleMonitor(monitorId) {
    try {
      const job = this.scheduledJobs.get(monitorId);
      if (job) {
        job.stop();
        this.scheduledJobs.delete(monitorId);
        console.log(`Unscheduled monitor ${monitorId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to unschedule monitor ${monitorId}:`, error);
      throw error;
    }
  }

  async runMonitorCheck(monitorId) {
    try {
      const monitor = Monitor.findById(this.db, monitorId);

      if (!monitor || !monitor.is_active) {
        console.log(`Skipping inactive or non-existent monitor ${monitorId}`);
        return;
      }

      this.stats.totalChecks++;
      this.stats.lastCheck = new Date();

      // Use HTTPMonitorService to perform actual HTTP check
      const checkResult = await this.httpMonitorService.performCheck(monitor);

      console.log(`Checked monitor ${monitorId} (${monitor.name}): ${checkResult.status.toUpperCase()} - ${checkResult.response_time}ms`);

      return checkResult;

    } catch (error) {
      this.stats.errors++;
      console.error(`Error checking monitor ${monitorId}:`, error);
      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledJobs: this.scheduledJobs.size,
      stats: this.stats,
      uptime: this.stats.lastCheck ? new Date() - this.stats.lastCheck : null
    };
  }

  getScheduledJobs() {
    const scheduleSummary = {
      totalMonitors: 0,
      byInterval: {},
      byType: {}
    };

    const monitors = Monitor.findAll(this.db);
    scheduleSummary.totalMonitors = monitors.length;

    for (const monitor of monitors) {
      const intervalKey = `${monitor.interval}s`;
      if (!scheduleSummary.byInterval[intervalKey]) {
        scheduleSummary.byInterval[intervalKey] = 0;
      }
      scheduleSummary.byInterval[intervalKey]++;

      if (!scheduleSummary.byType[monitor.type]) {
        scheduleSummary.byType[monitor.type] = 0;
      }
      scheduleSummary.byType[monitor.type]++;
    }

    return scheduleSummary;
  }
}

module.exports = SchedulerService;