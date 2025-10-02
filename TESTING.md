# Testing CloudPulse Monitor

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

### Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:3000

## UI/UX Features

The application features a modern design built with:
- **Tailwind CSS v4**: Utility-first CSS framework
- **Tabler Icons**: Professional icon set
- **Vite 5**: Lightning-fast development
- **Vue 3**: Composition API with TypeScript
- **Responsive Design**: Mobile-first approach

## Quick Test Guide

### 1. Restart the Backend Server
The backend needs to be restarted to apply the monitoring changes:

```bash
cd backend
npm run dev
```

You should see:
```
Server listening on port 3000
✅ Scheduler started automatically
Scheduled monitor X (Monitor Name) every 60 seconds
```

### 2. Test Manual Check
Click the "Check Now" button on any monitor in the Dashboard. You should see:
- Real HTTP request being made to the URL
- Actual response time displayed
- Status changing from "ERROR" to "UP" or "DOWN" based on real response

### 3. Test Automatic Monitoring
Wait for the scheduled interval (default 60 seconds). The monitors will automatically check and update.

### 4. Verify in Backend Logs
Watch the backend console for real monitoring logs:
```
Checked monitor 1 (Example): UP - 245ms
Checked monitor 2 (ULC Berlin): DOWN - 5002ms
```

## What Changed

### Before
- ❌ Simulated monitoring with `Math.random()`
- ❌ Fake response times
- ❌ No actual HTTP requests
- ❌ Manual scheduler start required

### After
- ✅ Real HTTP/HTTPS requests using axios
- ✅ Actual response times and status codes
- ✅ Proper error handling (DNS, timeout, connection errors)
- ✅ Automatic scheduler startup
- ✅ Graceful shutdown

## Troubleshooting

### Monitors still show "Never" checked
1. Restart the backend server
2. Check backend console for scheduler startup message
3. Click "Check Now" to trigger immediate check

### Backend errors
- Ensure `axios` is installed: `npm install` in backend directory
- Check backend console for error messages
- Verify monitors have valid URLs (http:// or https://)
