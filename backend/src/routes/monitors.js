// Monitor management routes
async function monitorRoutes(fastify, options) {
  const { monitorService, monitoringService } = options;

  // Get all monitors
  fastify.get('/monitors', async (request, reply) => {
    try {
      const monitors = monitorService.getAllMonitors();
      return monitors;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get monitor by ID
  fastify.get('/monitors/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const monitor = monitorService.getMonitorById(parseInt(id));
      if (!monitor) {
        return reply.code(404).send({ error: 'Monitor not found' });
      }
      return monitor;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Create new monitor
  fastify.post('/monitors', async (request, reply) => {
    try {
      const monitorData = request.body;
      const monitor = monitorService.createMonitor(monitorData);
      return monitor;
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Update monitor
  fastify.put('/monitors/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const monitorData = request.body;
      const monitor = monitorService.updateMonitor(parseInt(id), monitorData);
      return monitor;
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Delete monitor
  fastify.delete('/monitors/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      monitorService.deleteMonitor(parseInt(id));
      return { success: true };
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get monitor status/checks
  fastify.get('/monitors/:id/checks', async (request, reply) => {
    try {
      const { id } = request.params;
      const checks = monitoringService.getMonitorChecks(parseInt(id));
      return checks;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = monitorRoutes;