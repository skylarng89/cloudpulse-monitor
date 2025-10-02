```
cloudpulse-monitor/
├── backend/                    # Fastify API server
│   ├── src/
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   └── app.js             # Main application
│   ├── data/                  # SQLite database
│   └── package.json
├── frontend/                  # Vue.js application
│   ├── src/
│   │   ├── views/             # Page components
│   │   ├── services/          # API services
│   │   └── main.ts            # Application entry
│   └── package.json
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Backend container
├── frontend.Dockerfile       # Frontend container
├── nginx.conf                 # Backend reverse proxy config
├── frontend-nginx.conf       # Frontend serving config
└── README.md                  # This file
```

## Development Commands

### Populate Test Data

To populate the database with 50 test monitors for development/testing:

```bash
cd backend
npm run populate
```

This will create:
- 50 realistic monitors (HTTP, Ping, TCP)
- Mixed intervals (30s, 60s, 120s, 180s, 300s)
- Realistic company names and URLs

**Note:** Restart your backend after populating to schedule the new monitors.

### Clean Up Test Data

To remove all test monitors from the database:

**Option 1: Delete all monitors**
```bash
cd backend
sqlite3 monitoring.db "DELETE FROM monitors;"
sqlite3 monitoring.db "DELETE FROM monitor_checks;"
```

**Option 2: Delete only test monitors** (keeps your real monitors)
```bash
cd backend
sqlite3 monitoring.db "DELETE FROM monitors WHERE name LIKE '% API' OR name LIKE '% Website' OR name LIKE '% CDN' OR name LIKE '% Database' OR name LIKE '% Cache' OR name LIKE '% Storage' OR name LIKE '% Auth';"
```

**Option 3: Reset entire database**
```bash
cd backend
rm data/uptime.db
# Restart backend - it will recreate the database
```

---

## Database Schema

### Unique Constraints

The `monitors` table has a unique constraint on `(url, type)` to prevent duplicate monitoring:

```sql
UNIQUE(url, type)
```

**What this means:**
- ✅ You can have multiple monitors with the same name
- ✅ You can monitor the same URL with different types (e.g., HTTP and Ping)
- ❌ You cannot create two HTTP monitors for the same URL
- ❌ You cannot create two Ping monitors for the same host

**Example:**
```
✅ Name="Production", URL="https://api.com", Type="http"
✅ Name="Backup", URL="https://api.com", Type="ping"  (different type)
❌ Name="Secondary", URL="https://api.com", Type="http"  (duplicate)
```

**Migration Note:**
If you have an existing database, you'll need to recreate it to apply the unique constraint:
```bash
cd backend
rm data/uptime.db
npm start  # Will recreate with new schema
```