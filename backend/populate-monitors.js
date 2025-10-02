const Database = require('better-sqlite3');
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'monitoring.db');
const db = new Database(dbPath);

// Create tables if they don't exist
console.log('📦 Initializing database schema...\n');
db.exec(`
  CREATE TABLE IF NOT EXISTS monitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'http',
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS monitor_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monitor_id INTEGER NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    is_up INTEGER NOT NULL,
    error_message TEXT,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES monitors (id)
  );
`);
console.log('✅ Database schema ready\n');

// Sample data for realistic monitors
const companies = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook', 'Netflix', 'Twitter', 
  'LinkedIn', 'GitHub', 'Stack Overflow', 'Reddit', 'Wikipedia', 'YouTube',
  'Instagram', 'WhatsApp', 'Telegram', 'Discord', 'Slack', 'Zoom', 'Dropbox',
  'Spotify', 'SoundCloud', 'Twitch', 'TikTok', 'Pinterest', 'Tumblr',
  'Medium', 'Dev.to', 'Hacker News', 'Product Hunt', 'Stripe', 'PayPal',
  'Square', 'Shopify', 'WooCommerce', 'Mailchimp', 'SendGrid', 'Cloudflare',
  'DigitalOcean', 'Heroku', 'Vercel', 'Netlify', 'AWS', 'Azure', 'GCP',
  'Oracle', 'IBM', 'Salesforce', 'Adobe', 'Atlassian'
];

const services = ['API', 'Website', 'CDN', 'Database', 'Cache', 'Storage', 'Auth'];
const domains = [
  'example.com', 'test.com', 'demo.com', 'app.io', 'service.net',
  'cloud.dev', 'api.co', 'web.app', 'platform.io', 'tech.com'
];

const intervals = [30, 60, 120, 180, 300];

// Function to generate random monitor
function generateMonitor(index) {
  const company = companies[Math.floor(Math.random() * companies.length)];
  const service = services[Math.floor(Math.random() * services.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const interval = intervals[Math.floor(Math.random() * intervals.length)];
  
  // Random monitor type
  const types = ['http', 'ping', 'tcp'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let url;
  if (type === 'http') {
    const protocol = Math.random() > 0.5 ? 'https' : 'http';
    url = `${protocol}://${company.toLowerCase().replace(/\s/g, '')}.${domain}`;
  } else if (type === 'ping') {
    url = `${company.toLowerCase().replace(/\s/g, '')}.${domain}`;
  } else {
    // TCP
    const ports = [22, 80, 443, 3306, 5432, 6379, 27017, 8080, 9000];
    const port = ports[Math.floor(Math.random() * ports.length)];
    url = `${company.toLowerCase().replace(/\s/g, '')}.${domain}:${port}`;
  }
  
  return {
    name: `${company} ${service}`,
    url: url,
    type: type,
    interval_seconds: interval
  };
}

// Insert monitors
console.log('🚀 Starting to populate database with monitors...\n');

const insertStmt = db.prepare(`
  INSERT INTO monitors (name, url, type, interval_seconds, is_active)
  VALUES (?, ?, ?, ?, 1)
`);

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < 50; i++) {
  try {
    const monitor = generateMonitor(i);
    insertStmt.run(monitor.name, monitor.url, monitor.type, monitor.interval_seconds);
    successCount++;
    console.log(`✅ Added: ${monitor.name} (${monitor.type}) - ${monitor.url}`);
  } catch (error) {
    errorCount++;
    console.error(`❌ Error adding monitor ${i + 1}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   ✅ Successfully added: ${successCount} monitors`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log(`\n🎉 Done! Database populated with test monitors.`);
console.log(`\n💡 Tip: Restart your backend to schedule the new monitors.`);

db.close();
