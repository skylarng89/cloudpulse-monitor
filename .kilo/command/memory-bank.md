---
description: Memory bank for CloudPulse Monitor development session
created: 2026-03-27
last_updated: 2026-03-29
---

# CloudPulse Monitor - Development Memory Bank

## Goal

1. **Multi-database support** - Allow users to choose between PostgreSQL, MySQL, and SQLite for the backend
2. **Proper `.env` file support** - Enable Spring Boot to read environment variables from `.env` files
3. **Configurable CORS** - Allow CORS origins to be configured via environment variables
4. **Fix missing API endpoints** - Add missing scheduler and monitor check endpoints

## Instructions

- User wants flexibility to use SQLite, PostgreSQL, or MySQL
- The original version should not be sold (CC BY-NC 4.0 license applied)
- CORS should be configurable via `CORS_ALLOWED_ORIGINS` environment variable
- Profile selection (`SPRING_PROFILES_ACTIVE`) cannot work via `.env` due to Spring Boot loading order - must be set via environment variable or default in `application.yml`

## Project Context

- Backend: Spring Boot 4.0.x with Java 25, running on port 8080
- Frontend: Vue 3 + Tailwind CSS v4 + Vite, running on port 5173
- All timestamps from backend are ISO 8601 strings (OffsetDateTime)
- Uses `X-Idempotency-Key` header for POST requests
- Uses pnpm as package manager for frontend
- Uses Gradle for backend builds

## Discoveries

1. **`spring-dotenv` loads too late for profile selection** - The `SPRING_PROFILES_ACTIVE` variable in `.env` cannot be used to set the active profile because `application.yml` is parsed before the `.env` file is loaded. Solution: keep default `${SPRING_PROFILES_ACTIVE:sqlite}` in `application.yml`

2. **CORS was returning 403** - The original CORS configuration was working but needed to be configurable. Added `cors.allowed-origins` property that reads from `CORS_ALLOWED_ORIGINS` env var

3. **Missing backend endpoints** - The frontend calls several endpoints that didn't exist in the backend:
   - `/api/scheduler/run/{id}` - Run a check on a specific monitor
   - `/api/scheduler/status` - Get scheduler status
   - `/api/scheduler/start`, `/stop`, `/restart` - Scheduler control
   - `/api/monitors/{id}/checks` - Get checks for a monitor

4. **API Service Migration** (from frontend revamp):
   - Old `api.js` used default export `apiService`, new `api.ts` uses named export `{ api }`
   - Method name differences: `apiService.checkMonitor(id)` → `api.runMonitorCheck(id)`
   - New API uses native `fetch` instead of axios

5. **vue-tsc Issue** - `vue-tsc` version has an issue with "js emit is not supported" - use `pnpm build-only` for builds

## Accomplished

**Backend Multi-Database Support:**
- ✅ Added `me.paulschwarz:spring-dotenv:4.0.0` dependency for `.env` support
- ✅ Created SQLite, PostgreSQL, MySQL profile configurations in `application.yml`
- ✅ Added appropriate JDBC drivers for all three databases

**CORS Configuration:**
- ✅ Added `cors.allowed-origins` property in `application.yml`
- ✅ Updated `SecurityConfig.java` to read CORS origins from `@Value` annotation
- ✅ Updated `.env` and `.env.example` with `CORS_ALLOWED_ORIGINS` setting
- ✅ Removed `SPRING_PROFILES_ACTIVE` from `.env` files (doesn't work there)

**Missing API Endpoints:**
- ✅ Created `SchedulerController.java` with scheduler endpoints (`/api/scheduler/*`)
- ✅ Added `MonitorCheck` import to `MonitorController.java`
- ✅ Added query methods to `MonitorCheckRepository.java` for finding checks by monitor ID
- ✅ Added `/api/monitors/{id}/checks` endpoint to `MonitorController.java` with `limit` parameter

**Frontend Revamp (Previous Session - All Phases Complete):**
- ✅ Phase 1-6: Complete UI revamp with Vue 3 + Tailwind CSS v4 + Pinia
- ✅ Dark mode with system preference detection
- ✅ Collapsible sidebar navigation
- ✅ All components created and integrated

## Relevant Files

### Backend Configuration:
- `backend/build.gradle` - Dependencies including spring-dotenv
- `backend/src/main/resources/application.yml` - Profile configurations and CORS settings

### Backend Controllers:
- `backend/src/main/java/com/cloudpulse/backend/controller/MonitorController.java` - Monitor and check endpoints
- `backend/src/main/java/com/cloudpulse/backend/controller/SchedulerController.java` - Scheduler control endpoints

### Backend Security:
- `backend/src/main/java/com/cloudpulse/backend/config/SecurityConfig.java` - CORS configuration

### Backend Repository:
- `backend/src/main/java/com/cloudpulse/backend/repository/MonitorCheckRepository.java` - Check query methods

### Backend Models:
- `backend/src/main/java/com/cloudpulse/backend/model/MonitorCheck.java` - Check entity

### Environment Files:
- `.env` - Environment variables (gitignored)
- `.env.example` - Template for environment variables

### Frontend API Service:
- `frontend/src/services/api.ts` - Shows what API endpoints the frontend expects

## Current Status

- **Multi-database support:** ✅ Complete
- **CORS configuration:** ✅ Complete  
- **Scheduler endpoints:** ✅ Complete
- **Monitor checks endpoint:** ✅ Complete
- **Backend build:** ✅ Passing

## Running the Application

```bash
# Backend (from project root)
cd backend
./gradlew bootRun

# Frontend (from project root)
cd frontend
pnpm dev

# Build backend
cd backend
./gradlew build

# Build frontend (use build-only due to vue-tsc issue)
cd frontend
pnpm build-only
```

## Notes

- Profile selection must be done via environment variable: `SPRING_PROFILES_ACTIVE=postgres` or `mysql`
- Default profile is `sqlite` which requires no additional setup
- CORS origins should be set via `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`
- ESLint config is not set up for frontend - can be added later if needed
