const { MonitoringService } = require('../services');

// Monitoring and status routes
async function monitoringRoutes(fastify, options) {
  const { monitoringService } = options;

  // Get overall system status
  fastify.get('/status', async (request, reply) => {
    try {
      const status = await monitoringService.getSystemStatus();
      return status;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get recent checks for all monitors
  fastify.get('/checks', async (request, reply) => {
    try {
      const { limit = 50 } = request.query;
      const checks = monitoringService.getRecentChecks(parseInt(limit));
      return checks;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get incidents/downtime events
  fastify.get('/incidents', async (request, reply) => {
    try {
      const incidents = monitoringService.getIncidents();
      return incidents;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get uptime statistics
  fastify.get('/uptime', async (request, reply) => {
    try {
      const { days = 30 } = request.query;
      const uptime = await monitoringService.getUptimeStats(parseInt(days));
      return uptime;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = monitoringRoutes;