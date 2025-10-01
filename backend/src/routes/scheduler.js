// Scheduler management routes
async function schedulerRoutes(fastify, options) {
  const { schedulerService } = options;

  // Get scheduler status
  fastify.get('/scheduler/status', async (request, reply) => {
    try {
      const status = schedulerService.getStatus();
      return status;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Start scheduler
  fastify.post('/scheduler/start', async (request, reply) => {
    try {
      await schedulerService.start();
      return { success: true, message: 'Scheduler started' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Stop scheduler
  fastify.post('/scheduler/stop', async (request, reply) => {
    try {
      await schedulerService.stop();
      return { success: true, message: 'Scheduler stopped' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Restart scheduler
  fastify.post('/scheduler/restart', async (request, reply) => {
    try {
      await schedulerService.restart();
      return { success: true, message: 'Scheduler restarted' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get scheduled jobs
  fastify.get('/scheduler/jobs', async (request, reply) => {
    try {
      const jobs = schedulerService.getScheduledJobs();
      return jobs;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Force run a specific monitor check
  fastify.post('/scheduler/run/:monitorId', async (request, reply) => {
    try {
      const { monitorId } = request.params;
      await schedulerService.runMonitorCheck(parseInt(monitorId));
      return { success: true, message: 'Monitor check queued' };
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });
}

module.exports = schedulerRoutes;