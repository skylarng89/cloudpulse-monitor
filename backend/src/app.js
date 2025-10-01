// Register CORS
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'],
  credentials: true
});

// Register routes with /api prefix
fastify.register(monitorRoutes, {
  prefix: '/api',
  monitorService,
  monitoringService
});
fastify.register(monitoringRoutes, {
  prefix: '/api',
  monitoringService
});
fastify.register(schedulerRoutes, {
  prefix: '/api',
  schedulerService
});