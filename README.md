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