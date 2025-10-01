// ... existing code ...

// Import services
const { MonitorService, MonitoringService, HTTPMonitorService } = require('./services');

// Initialize services
const monitorService = new MonitorService(db);
const monitoringService = new MonitoringService(db);
const httpMonitorService = new HTTPMonitorService(db);

// ... existing API routes ...

fastify.get('/api/monitoring/http-stats', async (request, reply) => {
  try {
    const { hours = 24 } = request.query;
    const stats = await httpMonitorService.getHTTPStats(parseInt(hours));
    return stats;
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});

// ... rest of existing code ...