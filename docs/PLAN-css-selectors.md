# PLAN: Stable CSS Selectors via `data-qqq-*` Attributes

**Status:** COMPLETE

## Goal

Add stable, semantic CSS selectors so QQQ app developers can target specific UI elements in `QThemeMetaData.customCss`.

## Approach

- **Auto-generate** unique IDs for key interactive elements (buttons, inputs, nav items, menu items, table headers)
- **Require explicit `qqqId`** prop for custom overrides
- ID format: `data-qqq-id="{type}-{identifier}"`

## Implementation Summary

### New Files Created
- `src/qqq/utils/qqqIdUtils.ts` - ID sanitization utilities
- `src/qqq/context/QqqIdContext.tsx` - Optional scope context provider
- `docs/QQQ_CSS_SELECTORS_GUIDE.md` - Complete selector reference

### Components Modified

| Component | Selectors Added |
|-----------|-----------------|
| MDButton | `button-{text}`, `button-icon-{icon}` |
| SideNav | `sidenav-root`, `sidenav-{name}`, `sidenav-logout-button` |
| DynamicFormField | `input-{field}` |
| DynamicSelect | `select-{field}` |
| DataGridUtils | `table-header-{field}` |
| QueryScreenActionMenu | `menu-item-{text}` |
| RecordView | `record-view-*`, `record-section-*`, `menu-item-*` |
| EntityForm | `record-{mode}-*`, `form-section-*` |
| RecordSidebar | `record-sidebar`, `sidebar-item-*` |
| Home | `app-header-*`, `app-section-*`, `table-card-*`, `process-card-*` |

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
| Sections | `record-section-{name}` | `record-section-identity` |

## Example CSS Usage

```css
[data-qqq-id="menu-item-delete"] { display: none; }
[data-qqq-id="record-view-header-orders"] { background: #1976D2; }
[data-qqq-id^="sidebar-item-"] { border-left: 3px solid transparent; }
```

## Explicit Override

All components accept `qqqId` prop:
```tsx
<MDButton qqqId="custom-action">Do Something</MDButton>
// Result: data-qqq-id="button-custom-action"
```
