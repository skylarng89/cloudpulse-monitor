# CloudPulse Monitor

A fast, modern uptime monitoring tool built with Node.js (Fastify), Vue.js, and SQLite. Monitor your websites and services with response time tracking, SSL certificate checks, and comprehensive reporting.

## Features

- 🚀 **Fast Backend**: Built with Fastify for high performance
- 📊 **Real-time Dashboard**: Vue.js interface with live status updates
- ⏱️ **Response Time Monitoring**: Track and analyze response times
- 🔒 **SSL Certificate Monitoring**: Check SSL certificate expiry dates
- 📈 **Historical Reports**: Detailed uptime analytics and trends
- 📧 **Email Notifications**: Get alerted when services go down
- 🔄 **Multiple Check Types**: HTTP, ping, and TCP port monitoring

## Tech Stack

### Backend
- **Fastify** - High-performance web framework
- **SQLite** - Lightweight database with better-sqlite3
- **Node-cron** - Scheduled monitoring tasks
- **Axios** - HTTP client for monitoring requests
- **Nodemailer** - Email notifications

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Chart.js** - Beautiful charts and graphs
- **TypeScript** - Type safety

## Project Structure

```
cloudpulse-monitor/
├── backend/
│   ├── src/
│   │   ├── app.js              # Main application file
│   │   └── (other services)    # Monitoring services
│   ├── data/                   # SQLite database
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/         # Reusable Vue components
    │   ├── views/              # Page components
    │   ├── router/             # Vue router configuration
    │   └── main.ts             # Application entry point
    └── package.json
```

## Quick Start

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Start the Backend**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3000`

3. **Start the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Settings
PORT=3000
NODE_ENV=development
```

### Database

The application uses SQLite by default. The database file will be created automatically at `backend/data/uptime.db`.

## API Endpoints

### Monitors
- `GET /api/monitors` - Get all monitors
- `POST /api/monitors` - Create a new monitor
- `GET /api/monitors/:id` - Get a specific monitor
- `PUT /api/monitors/:id` - Update a monitor
- `DELETE /api/monitors/:id` - Delete a monitor

### Monitor Checks
- `GET /api/checks` - Get recent check results
- `GET /api/checks/:monitorId` - Get checks for a specific monitor

### Reports
- `GET /api/reports/uptime` - Get uptime statistics
- `GET /api/reports/response-times` - Get response time data

## Development

### Adding New Monitor Types

1. Add the check type to the database schema
2. Implement the check logic in `src/services/monitorService.js`
3. Update the frontend to support the new type

### Adding New Notification Methods

1. Implement the notification service in `src/services/notificationService.js`
2. Add configuration options
3. Update the frontend settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please create an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ using Fastify, Vue.js, and modern web technologies.