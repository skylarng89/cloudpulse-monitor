// ... existing code ...

// Import services
const { MonitorService, MonitoringService, SchedulerService } = require('./services');

// Initialize services
const monitorService = new MonitorService(db);
const monitoringService = new MonitoringService(db);
const schedulerService = new SchedulerService(db);

// ... existing code ...