const Fastify = require('fastify');
const Database = require('better-sqlite3');

// Import routes
const monitorRoutes = require('./routes/monitors');
const monitoringRoutes = require('./routes/monitoring');
const schedulerRoutes = require('./routes/scheduler');

// Import services
const { MonitorService, MonitoringService, SchedulerService } = require('./services');

// Initialize database
const db = new Database('./data/uptime.db');

// Create database tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS monitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'http',
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    timeout_seconds INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(url, type)
  );

  CREATE TABLE IF NOT EXISTS monitor_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monitor_id INTEGER NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    is_up BOOLEAN NOT NULL,
    error_message TEXT,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES monitors (id)
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monitor_id INTEGER NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    duration_seconds INTEGER,
    is_resolved BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (monitor_id) REFERENCES monitors (id)
  );
`);

// Initialize services
const monitorService = new MonitorService(db);
const monitoringService = new MonitoringService(db);
const schedulerService = new SchedulerService(db);

// Create Fastify app
const fastify = Fastify({
  logger: true
});

// Register CORS FIRST (before other middleware)
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'],
  credentials: true
});

// Register routes with /api prefix
fastify.register(monitorRoutes, {
  prefix: '/api',
  monitorService,
  monitoringService,
  schedulerService
});
fastify.register(monitoringRoutes, {
  prefix: '/api',
  monitoringService
});
fastify.register(schedulerRoutes, {
  prefix: '/api',
  schedulerService
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
    
    // Auto-start scheduler for monitoring
    try {
      await schedulerService.start();
      console.log('✅ Scheduler started automatically');
    } catch (error) {
      console.warn('⚠️ Failed to auto-start scheduler:', error.message);
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  try {
    if (schedulerService.isRunning) {
      await schedulerService.stop();
      console.log('✅ Scheduler stopped');
    }
  } catch (error) {
    console.warn('⚠️ Error stopping scheduler:', error.message);
  }
  await fastify.close();
  db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  try {
    if (schedulerService.isRunning) {
      await schedulerService.stop();
      console.log('✅ Scheduler stopped');
    }
  } catch (error) {
    console.warn('⚠️ Error stopping scheduler:', error.message);
  }
  await fastify.close();
  db.close();
  process.exit(0);
});

start();