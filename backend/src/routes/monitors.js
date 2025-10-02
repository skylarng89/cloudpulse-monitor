// Monitor management routes
async function monitorRoutes(fastify, options) {
  const { monitorService, monitoringService, schedulerService } = options;

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
      const monitor = await monitorService.createMonitor(monitorData);
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
      const monitor = await monitorService.updateMonitor(parseInt(id), monitorData);
      return monitor;
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Delete monitor
  fastify.delete('/monitors/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const monitorId = parseInt(id);
      
      // Unschedule the monitor if scheduler is running
      if (schedulerService && schedulerService.isRunning) {
        schedulerService.unscheduleMonitor(monitorId);
      }
      
      // Delete the monitor and all related data
      monitorService.deleteMonitor(monitorId);
      
      return { success: true };
    } catch (error) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Check all monitors manually (MUST be before /:id/check to avoid route conflict)
  fastify.post('/monitors/check-all', async (request, reply) => {
    try {
      console.log('Check all monitors endpoint called');
      const monitors = await monitorService.getAllMonitors();
      console.log(`Found ${monitors.length} monitors to check`);
      
      if (monitors.length === 0) {
        return {
          success: true,
          message: 'No monitors to check',
          results: []
        };
      }

      // Check all monitors
      console.log('Starting to check all monitors...');
      const results = await monitoringService.checkAllMonitors(monitors);
      console.log('All monitors checked successfully');
      
      return {
        success: true,
        message: `Checked ${monitors.length} monitor(s)`,
        results: results
      };
    } catch (error) {
      console.error('Error in check-all endpoint:', error);
      reply.code(500).send({ error: error.message, stack: error.stack });
    }
  });

  // Manually check a specific monitor
  fastify.post('/monitors/:id/check', async (request, reply) => {
    try {
      const { id } = request.params;
      const monitor = monitorService.getMonitorById(parseInt(id));
      
      if (!monitor) {
        return reply.code(404).send({ error: 'Monitor not found' });
      }

      // Perform the check
      const result = await monitoringService.performCheck(monitor);
      
      return {
        success: true,
        result: result
      };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get monitor status/checks
  fastify.get('/monitors/:id/checks', async (request, reply) => {
    try {
      const { id } = request.params;
      const { limit } = request.query;
      const checks = monitoringService.getMonitorChecks(parseInt(id), limit ? parseInt(limit) : 100);
      return checks;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = monitorRoutes;