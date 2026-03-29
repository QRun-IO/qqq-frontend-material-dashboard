# The Selector Problem

The theme system works. Colors flow from Java to CSS variables to rendered components. Ship it, right?

Then the first real feedback: "How do I hide the Developer Mode menu item?"

Good question. Check the DOM. The menu item is a `<li>` with class `.MuiMenuItem-root` and some generated hash like `.css-kk1bwy-MuiMenuItem-root`. No stable identifier. No way to target just that one menu item.

"Use the text content?"

```css
/* This doesn't exist in CSS */
.MuiMenuItem-root:contains("Developer Mode") {
   display: none;
}
```

CSS doesn't have a `:contains()` selector. JavaScript does, but we're trying to enable customization through `customCss` in `QThemeMetaData`. Pure CSS. No JS allowed.

The customer could override the whole menu. Or hide all menu items and recreate them. But that's insane for "hide one button."

## The MUI Class Name Problem

MUI generates class names at build time. They're deterministic but meaningless:

```html
<button class="MuiButton-root MuiButton-containedPrimary css-1hw9j7s">
   Save
</button>
```

That `css-1hw9j7s` changes if MUI's internals change. Can't rely on it. The `MuiButton-*` classes are stable but they're type selectors, not instance selectors. Every primary button has the same classes.

Checked if MUI has built-in solutions. It does have a `className` generator you can configure. Doesn't help - it changes the hash algorithm, not the semantic meaning. Still no way to say "this specific button."

There's no built-in "give every element a unique stable ID" feature. MUI expects you to know which button you're styling because you wrote the code. Makes sense for apps, breaks down for configurable frameworks.

## Data Attributes

The answer is `data-*` attributes. HTML's escape hatch for custom metadata.

```html
<button data-qqq-id="button-save" class="MuiButton-root ...">
   Save
</button>
```

Now CSS can target it:

```css
[data-qqq-id="button-save"] {
   background-color: green !important;
}
```

Stable. Semantic. Survives MUI upgrades. Works in `customCss`.

## Auto-Generation

Could require developers to manually add `qqqId` props everywhere. But that's tedious and error-prone. Most elements have obvious identifiers already - button text, field names, menu item labels.

So: auto-generate from what's already there.

```typescript
function generateButtonId(qqqId?: string, children?: ReactNode, iconName?: string): string {
   if (qqqId) return `button-${sanitizeId(qqqId)}`;

   const text = extractTextFromChildren(children);
   if (text) return `button-${sanitizeId(text)}`;

   if (iconName) return `button-icon-${sanitizeId(iconName)}`;

   return undefined;
}
```

A "Save" button becomes `button-save`. An icon-only edit button becomes `button-icon-edit`. Explicit `qqqId` prop overrides everything.

Same pattern for inputs (from field name), selects (from field name), nav items (from route), menu items (from text), table headers (from column field).

The sanitizer strips everything down to lowercase alphanumeric with dashes:

```typescript
function sanitizeId(text: string): string {
   return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
}
```

"Bulk Edit With File" becomes `bulk-edit-with-file`. Predictable. Debuggable.

## The Implementation

Modified eight components:

- `MDButton` - core button, auto-generates from children or icon
- `DefaultButtons` - standard buttons get explicit IDs (`button-save`, `button-cancel`, etc.)
- `SideNavItem` - nav items from `name` prop
- `QueryScreenActionMenu` - all menu items from text
- `DynamicFormField` - text inputs from field name
- `DynamicSelect` - dropdowns from field name
- `DataGridUtils` - table headers from column field

Created utility file `qqqIdUtils.ts` with generators for each element type. Created `QqqIdContext.tsx` for optional page-level scoping (not used yet, but there for future).

Total: ~200 lines of new code, ~50 lines of modifications across existing components.

## What You Can Do Now

Hide a menu item:

```java
.withCustomCss("""
   [data-qqq-id="menu-item-developer-mode"] {
      display: none;
   }
""")
```

Style a specific button:

```css
[data-qqq-id="button-save"] {
   background-color: #4CAF50 !important;
}
```

Target inputs by pattern:

```css
[data-qqq-id^="input-order"] {
   border-left: 3px solid blue;
}
```

Hide a nav item:

```css
[data-qqq-id="sidenav-admin"] {
   display: none;
}
```

Style table headers:

```css
[data-qqq-id="table-header-status"] {
   font-weight: bold;
   background-color: #FFF3E0;
}
```

Inspect any element in DevTools, find its `data-qqq-id`, target it in CSS. That simple.

## What's Not Covered Yet

Tabs aren't wired up. Neither are cards, modals, or the dozens of other component types. The pattern is established though - adding more is mechanical.

No tests yet for the selectors themselves. The theme tests verify colors render correctly; should add tests that verify IDs appear on elements.

The scoping context exists but isn't used. Idea is to wrap pages in `<QqqIdProvider scope="record-view">` so you can write:

```css
[data-qqq-scope="record-view"] [data-qqq-id="button-edit"] {
   display: none;
}
```

Hide the edit button only on view screens, not everywhere. That's future work.

## The Pattern

This keeps happening. Build a feature, ship it, get feedback that reveals a gap in the abstraction. Theme colors work but you can't target specific elements. Fix that, ship it, wait for the next gap.

The architecture is holding up though. Java metadata → frontend → CSS → rendered output. Each layer adds capability without breaking the ones below.

Version for testing: `0.36.0-pluggable-themes-css-selectors-SNAPSHOT`
