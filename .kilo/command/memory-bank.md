---
description: Memory bank for CloudPulse Monitor frontend revamp session
created: 2026-03-27
last_updated: 2026-03-28
---

# CloudPulse Monitor - Frontend Revamp Memory Bank

## Goal

Revamp the CloudPulse Monitor frontend with a modern, beautiful, and responsive UI while maintaining Vue 3 + Tailwind CSS v4 + Vite. Key requirements:
- Use Tabler webfont icons (already loaded via CDN)
- Minimize external dependencies (remove axios, date-fns, npm-run-all; keep chart.js + vue-chartjs)
- Use Pinia for state management
- Use Vue Router
- Use TypeScript
- Use pnpm as package manager
- Implement collapsible sidebar navigation (like modern SaaS apps)
- Implement full dark mode with system preference detection
- Keep chart.js for Reports view

## Project Context

- Backend: Spring Boot 4.0.x with Java 25, running on port 8080
- Frontend: Vue 3 + Tailwind CSS v4 + Vite
- All timestamps from backend are ISO 8601 strings (OffsetDateTime)
- Uses `X-Idempotency-Key` header for POST requests

## Discoveries

### API Service Migration

- Old `api.js` used default export `apiService`, new `api.ts` uses named export `{ api }`
- Method name differences between old and new API:
  - `apiService.checkMonitor(id)` → `api.runMonitorCheck(id)`
  - `apiService.triggerManualCheck()` → `api.checkAllMonitors()`
- New API uses native `fetch` instead of axios

### Date Formatting Migration

- Replaced `date-fns` with native `Intl` API via `useTimeFormat.ts` composable
- `formatDateTime()` provides similar output to `format(date, 'MMM dd, HH:mm')`

### vue-tsc Issue

- `vue-tsc` version has an issue with "js emit is not supported"
- Use `pnpm build-only` for testing builds instead of `pnpm type-check`

### Type System

- New types use camelCase (`intervalSeconds`) while backend uses snake_case (`interval_seconds`)
- Views still use inline interfaces with snake_case to match backend responses

## Accomplished

**Phase 1 (Complete):**
- ✅ Cleaned `package.json` - removed axios, date-fns, npm-run-all; added pinia
- ✅ Created `src/types/index.ts` - shared interfaces
- ✅ Created `src/services/api.ts` - typed fetch-based API service
- ✅ Created `src/composables/useTimeFormat.ts` - native Intl date formatting
- ✅ Created `src/stores/monitors.ts` - Pinia store
- ✅ Created `src/stores/app.ts` - Pinia store for theme/sidebar
- ✅ Pinia registered in `main.ts`
- ✅ Dark mode CSS custom properties in `style.css`

**Phase 2 (Complete):**
- ✅ Created all UI components: `BaseCard.vue`, `BaseModal.vue`, `BaseBadge.vue`, `BaseButton.vue`, `BaseInput.vue`, `BaseSelect.vue`, `BaseSpinner.vue`, `BaseEmpty.vue`
- ✅ Created layout components: `AppSidebar.vue`, `AppHeader.vue`
- ✅ Updated `router/index.ts` with lazy loading and route meta
- ✅ Updated `App.vue` with new layout shell
- ✅ Deleted old `api.js` and `api.d.ts` files
- ✅ Fixed build errors in view files (API imports, method names, date formatting)
- ✅ Build passes successfully

## Relevant Files

### Created (Phase 1 & 2):

**UI Components:**
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/ui/BaseCard.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/ui/BaseModal.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/ui/BaseBadge.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/ui/BaseButton.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/ui/BaseInput.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/ui/BaseSelect.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/ui/BaseSpinner.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/ui/BaseEmpty.vue`

**Layout Components:**
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/layout/AppSidebar.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/components/layout/AppHeader.vue`

**Infrastructure:**
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/types/index.ts`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/services/api.ts`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/composables/useTimeFormat.ts`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/stores/monitors.ts`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/stores/app.ts`

### Updated:
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/router/index.ts`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/App.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/views/Dashboard.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/views/Monitors.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/views/Reports.vue`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/main.ts`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/style.css`

### Deleted:
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/services/api.js`
- `/mnt/samsung/repositories/cloudpulse-monitor/frontend/src/services/api.d.ts`

### Plan File:
- `/mnt/samsung/repositories/cloudpulse-monitor/.kilo/plans/1774639673929-witty-mountain.md`

## Current Status

- **Phase 1:** ✅ Complete
- **Phase 2:** ✅ Complete
- **Phase 3-6:** Pending

Build passes successfully. All view files compile and API imports are resolved.

## Next Steps

1. **Phase 3: Dashboard Revamp** - Refactor `Dashboard.vue`:
   - Use Pinia store instead of local state
   - Extract stats cards to `components/dashboard/StatsCard.vue`
   - Extract scheduler card to `components/dashboard/SchedulerCard.vue`
   - Extract recent checks table to `components/dashboard/RecentChecksTable.vue`
   - Implement proper dark mode styling
   - Add responsive design for mobile

2. **Phase 4-6:** Continue with Monitors revamp, Reports revamp, and polish
