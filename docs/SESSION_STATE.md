# Session State - Pluggable Themes + CSS Selectors

**Last Updated:** 2026-01-05
**Branch:** `feature/pluggable-themes-v2-mui`
**Version:** `0.36.0-pluggable-themes-css-selectors-SNAPSHOT`

## Current Status

CSS selector implementation complete. All major UI elements now have `data-qqq-id` attributes for targeted styling via `QThemeMetaData.customCss`.

## To Continue

Run `git pull` then review uncommitted changes with `git status`. The TODO.md file tracks remaining tasks.

## Files Modified (Uncommitted)

### New Files
- `src/qqq/utils/qqqIdUtils.ts` - ID sanitization utilities
- `src/qqq/context/QqqIdContext.tsx` - Optional scope context provider
- `docs/QQQ_CSS_SELECTORS_GUIDE.md` - Complete selector reference

### Modified Files
- `src/qqq/pages/records/view/RecordView.tsx` - View screen selectors
- `src/qqq/components/forms/EntityForm.tsx` - Create/edit screen selectors
- `src/qqq/components/misc/RecordSidebar.tsx` - Sidebar selectors
- `src/qqq/components/legacy/MDButton/index.tsx` - Button selectors
- `src/qqq/components/legacy/MDButton/MDButtonRoot.tsx` - CSS variable gradients
- `src/qqq/components/horseshoe/sidenav/*` - Nav selectors
- `src/qqq/components/forms/DynamicFormField.tsx` - Input selectors
- `src/qqq/components/forms/DynamicSelect.tsx` - Select selectors
- `src/qqq/pages/records/query/RecordQuery.tsx` - Query screen selectors
- `src/qqq/components/query/*` - Query control selectors
- `src/qqq/pages/apps/Home.tsx` - App home selectors
- `src/qqq/components/widgets/statistics/MiniStatisticsCard.tsx` - Card selectors
- `src/qqq/components/processes/ProcessLinkCard.tsx` - Process card selectors
- `src/qqq/utils/DataGridUtils.tsx` - Table header selectors

## CSS Selector Coverage

| Screen | Elements with Selectors |
|--------|------------------------|
| **Sidenav** | Root, items, collapse groups, logout button |
| **App Home** | App headers, section cards, table/process/report cards |
| **Record Query** | Action menu, views button, columns button, table headers |
| **Record View** | Header, avatar, title, actions menu, menu items, sections, button bar, delete dialog |
| **Record Create** | Header, avatar, title, sections, button bar |
| **Record Edit** | Header, avatar, title, sections, button bar |
| **Forms** | All inputs, selects, field containers |

## Selector Patterns

| Element | Pattern | Example |
|---------|---------|---------|
| Buttons | `button-{text}` | `button-save` |
| Icon buttons | `button-icon-{icon}` | `button-icon-delete` |
| Menu items | `menu-item-{text}` | `menu-item-bulk-edit` |
| Nav items | `sidenav-{name}` | `sidenav-orders` |
| Inputs | `input-{field}` | `input-first-name` |
| Selects | `select-{field}` | `select-status` |
| Table headers | `table-header-{field}` | `table-header-order-id` |
| Record view | `record-view-{element}-{table}` | `record-view-header-orders` |
| Record create | `record-create-{element}-{table}` | `record-create-title-person` |
| Record edit | `record-edit-{element}-{table}` | `record-edit-avatar-customer` |
| Sections | `record-section-{name}` | `record-section-identity` |
| Form sections | `form-section-{name}` | `form-section-details` |
| Sidebar items | `sidebar-item-{name}` | `sidebar-item-identity` |

## Build Commands

```bash
npm run build                    # Build frontend
mvn clean install -DskipTests    # Install snapshot locally
```
