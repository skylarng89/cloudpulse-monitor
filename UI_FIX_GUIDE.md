# UI/UX Fix Guide

## Issues Identified

Looking at the screenshots, there are several styling inconsistencies:

1. **Dashboard** - Has the new design but stat cards look cramped
2. **Monitors Page** - Still using old blue buttons and basic styling
3. **Reports Page** - Still using old styling
4. **Overall** - Inconsistent use of icons and colors

## Quick Fixes Needed

### 1. Fix Dashboard Stat Cards

The stat cards need better spacing. Update the CSS in `Dashboard.vue`:

```css
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1.5rem;  /* Increase from 1rem */
  transition: all 0.3s ease;
  border-left: 4px solid;
  min-height: 120px;  /* Add minimum height */
}

.stat-icon {
  width: 64px;  /* Increase from 56px */
  height: 64px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;  /* Increase from 1.75rem */
  flex-shrink: 0;
}
```

### 2. Monitors Page - Add Icons to Buttons

Replace emoji icons with Tabler icons:

**Before:**
```html
<button @click="checkMonitor(monitor.id)" class="btn-small" title="Check Now">
  🔍
</button>
<button @click="confirmDelete(monitor)" class="btn-small btn-danger" title="Delete">
  🗑️
</button>
```

**After:**
```html
<button @click="checkMonitor(monitor.id)" class="btn btn-small btn-primary" title="Check Now">
  <i class="ti ti-refresh"></i>
</button>
<button @click="confirmDelete(monitor)" class="btn btn-small btn-danger" title="Delete">
  <i class="ti ti-trash"></i>
</button>
```

### 3. Update Button Classes

All pages should use the global button classes from `style.css`:

- `.btn` - Base button class
- `.btn-primary` - Primary actions (indigo color)
- `.btn-secondary` - Secondary actions (gray color)
- `.btn-danger` - Destructive actions (red color)
- `.btn-small` - Smaller buttons

Remove local button styles and use the global ones.

### 4. Add Page Headers with Icons

Each page should have a consistent header:

```html
<div class="page-header">
  <div>
    <h1 class="page-title">
      <i class="ti ti-[icon-name]"></i>
      Page Title
    </h1>
    <p class="page-subtitle">Page description</p>
  </div>
  <div class="header-actions">
    <!-- Action buttons -->
  </div>
</div>
```

Icon suggestions:
- Dashboard: `ti-dashboard`
- Monitors: `ti-server`
- Reports: `ti-chart-line`

### 5. Modernize Modals

Update modal styling to match the new design:

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);  /* Darker overlay */
  backdrop-filter: blur(4px);  /* Add blur effect */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: var(--radius-xl);  /* Use CSS variable */
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);  /* Stronger shadow */
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 6. Update Table Styling

For the Monitors page table:

```css
.monitors-table {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.monitors-table table {
  width: 100%;
  border-collapse: collapse;
}

.monitors-table th {
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 2px solid var(--gray-200);
}

.monitors-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--gray-100);
  color: var(--gray-700);
}

.monitors-table tbody tr {
  transition: all 0.2s ease;
}

.monitors-table tbody tr:hover {
  background: var(--gray-50);
  transform: scale(1.01);
}
```

## Color Reference

Use these CSS variables (already defined in `style.css`):

- `--primary`: #6366f1 (Indigo)
- `--success`: #10b981 (Green)
- `--danger`: #ef4444 (Red)
- `--warning`: #f59e0b (Orange)
- `--info`: #3b82f6 (Blue)

## Tabler Icons Reference

Common icons to use:
- `ti-dashboard` - Dashboard
- `ti-server` - Servers/Monitors
- `ti-chart-line` - Reports/Charts
- `ti-plus` - Add/Create
- `ti-refresh` - Refresh/Check
- `ti-trash` - Delete
- `ti-eye` - View/Details
- `ti-edit` - Edit
- `ti-x` - Close
- `ti-check` - Success
- `ti-alert-circle` - Error/Warning
- `ti-clock` - Time
- `ti-activity` - Activity/Pulse

## Implementation Priority

1. **High Priority**: Fix Dashboard stat card spacing
2. **High Priority**: Update Monitors page buttons with icons
3. **Medium Priority**: Modernize modal styling
4. **Medium Priority**: Update table styling
5. **Low Priority**: Add page headers to all pages

## Testing Checklist

After making changes:
- [ ] All buttons have consistent styling
- [ ] Icons are used instead of emojis
- [ ] Colors match the design system
- [ ] Hover effects work smoothly
- [ ] Modals have blur backdrop
- [ ] Tables are readable and styled
- [ ] Mobile responsive (test at 768px width)
