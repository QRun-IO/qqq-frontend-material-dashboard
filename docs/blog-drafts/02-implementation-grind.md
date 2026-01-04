# The Implementation Grind

First attempt:

```css
.MuiButton-root {
   background-color: var(--qqq-primary-color);
}
```

Doesn't work. MUI generates class names like `.css-1hw9j7s` and injects them with inline-level specificity. Regular stylesheets don't stand a chance.

`!important` it is:

```css
.MuiButton-containedPrimary {
   background-color: var(--qqq-primary-color) !important;
}
```

Not elegant, but effective. Buttons, inputs, cards - all picking up theme colors now.

Then a weirder problem. A test for `textSecondary` keeps failing even though the CSS variable is set correctly and the value matches.

After debugging: the test was finding a `.MuiTypography-body2` element in the sidebar, not the main content. The sidebar has its own text color variable. The test found an element, checked its color, but checked the wrong element.

The fix:

```css
.MuiTypography-body2:not(.MuiDrawer-root *):not(.MuiDrawer-paper *) {
   color: var(--qqq-text-secondary) !important;
}
```

"Apply this style, but not if inside the drawer."

Same pattern needed for the branded header - it has its own text color too. So now there are `:not()` selectors everywhere.

```css
.MuiTypography-body2:not(.MuiDrawer-root *):not(.MuiDrawer-paper *):not(.qqq-branded-header-bar *) {
   color: var(--qqq-text-secondary) !important;
}
```

The CSS override file is around 1200 lines now. Organized by component group:

- Core colors and typography
- Sidebar states (default, hover, selected)
- Branded header
- Data tables (headers, cells, borders)
- Form inputs
- Cards and surfaces
- Buttons and links

Each section targets the MUI classes for that component type and forces them to use CSS variables.

What's working: font family and sizes flow through cleanly. Border radius applies everywhere. Table headers picked up the colors without issues. Sidebar selected and hover states work correctly.

Next: actual browser tests. Playwright, not Jest. Render the page and check `getComputedStyle()`. The tests need to verify what the user actually sees, not just that variables are set.
