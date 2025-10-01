// ... existing code ...

// Import services
const { MonitorService } = require('./services');

// Initialize services
const monitorService = new MonitorService(db);

// Updated API routes using services
fastify.get('/api/monitors', async (request, reply) => {
  try {
    const monitors = await monitorService.getAllMonitors();
    return monitors;
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});

fastify.post('/api/monitors', async (request, reply) => {
  try {
    const { name, url, type = 'http', interval = 60 } = request.body;
    const monitor = await monitorService.createMonitor({ name, url, type, interval });
    return { id: monitor.id };
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
});

fastify.get('/api/monitors/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const monitor = await monitorService.getMonitorById(parseInt(id));

    if (!monitor) {
      return reply.code(404).send({ error: 'Monitor not found' });
    }

    return monitor;
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});

fastify.put('/api/monitors/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const updateData = request.body;

    const success = await monitorService.updateMonitor(parseInt(id), updateData);
    if (!success) {
      return reply.code(404).send({ error: 'Monitor not found' });
    }

    return { success: true };
  } catch (error) {
    reply.code(400).send({ error: error.message });
  }
});

fastify.delete('/api/monitors/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const success = await monitorService.deleteMonitor(parseInt(id));
    return { success };
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});

// Add new service-based endpoints
fastify.get('/api/monitors/stats', async (request, reply) => {
  try {
    const stats = await monitorService.getMonitorStats();
    return stats;
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});

fastify.get('/api/monitors/:id/checks', async (request, reply) => {
  try {
    const { id } = request.params;
    const { limit = 50, hours = 24 } = request.query;

    const checks = await monitorService.getMonitorChecks(parseInt(id), parseInt(limit));
    return checks;
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});

fastify.get('/api/monitors/:id/stats', async (request, reply) => {
  try {
    const { id } = request.params;
    const { hours = 24 } = request.query;

    const stats = await monitorService.getMonitorCheckStats(parseInt(id), parseInt(hours));
    return stats;
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});

fastify.get('/api/system/stats', async (request, reply) => {
  try {
    const { hours = 24 } = request.query;
    const stats = await monitorService.getSystemCheckStats(parseInt(hours));
    return stats;
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
});

// ... rest of existing code ...