# QQQ CSS Selectors Guide

QQQ automatically generates stable `data-qqq-id` attributes on key UI elements, enabling precise CSS targeting via `QThemeMetaData.customCss`.

## ID Format

```
data-qqq-id="{type}-{identifier}"
```

IDs are generated from element text, field names, or labels. Values are lowercase, alphanumeric with dashes, max 50 characters.

## Auto-Generated Elements

| Element | ID Source | Example |
|---------|-----------|---------|
| Buttons | Text content or icon | `button-save`, `button-icon-edit` |
| Text Inputs | Field name or label | `input-first-name` |
| Selects | Field name or label | `select-status` |
| Checkboxes | Field name or label | `switch-is-active` |
| Nav Items | Name prop | `sidenav-orders` |
| Menu Items | Text content | `menu-item-bulk-edit` |
| Table Headers | Field name | `table-header-order-id` |

## CSS Usage Examples

```css
/* Target specific button */
[data-qqq-id="button-save"] {
   background-color: green;
}

/* Target inputs by pattern */
[data-qqq-id^="input-order"] {
   border-color: blue;
}

/* Hide specific menu item */
[data-qqq-id="menu-item-developer-mode"] {
   display: none;
}

/* Style table header */
[data-qqq-id="table-header-status"] {
   font-weight: bold;
}

/* Combine with scope context */
[data-qqq-scope="record-view"] [data-qqq-id="button-edit"] {
   display: none;
}
```

## Explicit Override

Components accept an optional `qqqId` prop for explicit IDs:

```tsx
<MDButton qqqId="custom-action">Do Something</MDButton>
// Result: data-qqq-id="button-custom-action"
```

## Scoping Context

Use `QqqIdProvider` to add scope attributes for page-level targeting:

```tsx
<QqqIdProvider scope="record-view">
   {/* Children get wrapped in data-qqq-scope="record-view" */}
</QqqIdProvider>
```

## Key Files

- `src/qqq/utils/qqqIdUtils.ts` - ID generation utilities
- `src/qqq/context/QqqIdContext.tsx` - Scoping context provider
