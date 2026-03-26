# UI/UX & Design

## Frontend Architecture
- **Framework**: Vue 3 (Composition API)
- **Styling**: TailwindCSS v4 with built-in utility classes.

## Components & Structure
- **Dashboard**: Modern UI featuring toast notifications, smart search, and pagination.
- **Monitoring Table**: Color-coded status badges:
  - 🟢 Green: Up
  - 🔴 Red: Down
  - 🟡 Yellow: Error
  - ⚪ Gray: Unknown

## Changes Planned
- The frontend UI will largely remain unchanged during the migration.
- The API client (`services/api.js`) will need to be verified to ensure compatibility with the new Spring Boot backend endpoints and response formats.
