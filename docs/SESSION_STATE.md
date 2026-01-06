# Session State - Pluggable Themes + CSS Selectors

**Last Updated:** 2026-01-06
**Branch:** `feature/pluggable-themes-v2-mui-css-selectors`
**Version:** `0.36.0-pluggable-themes-css-selectors-SNAPSHOT`

## Current Status

All theming work complete. JAR built and verified with correct JS (`main.2f9c1ea9.js`).

**Latest commits:**
- `349cf76` - feat(theme): add CSS variable theming to process screens
- `1e80deb` - fix(theme): consume sidebarIconColor and fontSizeBase CSS variables

## To Continue

Ready for PR to develop. Update version back to `0.36.0-SNAPSHOT` before merge.

## Key Files

### New Files (This Feature)
- `src/qqq/utils/qqqIdUtils.ts` - ID sanitization utilities
- `src/qqq/context/QqqIdContext.tsx` - Optional scope context provider
- `docs/QQQ_CSS_SELECTORS_GUIDE.md` - Complete selector reference
- `docs/PLAN-css-selectors.md` - Implementation plan (complete)

### Components with Selectors
- `src/qqq/pages/records/view/RecordView.tsx` - View screen
- `src/qqq/components/forms/EntityForm.tsx` - Create/edit screens
- `src/qqq/components/misc/RecordSidebar.tsx` - Section sidebar
- `src/qqq/components/legacy/MDButton/*` - Buttons
- `src/qqq/components/horseshoe/sidenav/*` - Navigation
- `src/qqq/components/forms/DynamicFormField.tsx` - Inputs
- `src/qqq/components/forms/DynamicSelect.tsx` - Selects
- `src/qqq/pages/records/query/RecordQuery.tsx` - Query screen
- `src/qqq/pages/apps/Home.tsx` - App home
- `src/qqq/utils/DataGridUtils.tsx` - Table headers

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
