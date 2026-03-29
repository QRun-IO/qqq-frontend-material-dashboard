# Lets build pluggable themes. I'm Scared.

Every enterprise app eventually gets the same request. "Can we make it blue instead of purple?" "Can we put our logo up there?" "The sidebar needs to match our brand guidelines."

And every time it's grep through the codebase for hex codes, find them in twelve different files, change them, miss one, deploy, customer notices, repeat.

So let's build a proper theme system.

The theme should be defined on the backend, in Java, because that's where the rest of the app configuration lives. Tables, processes, reports - all defined in Java metadata. The theme should work the same way.

```java
qInstance.setTheme(new QThemeMetaData()
   .withPrimaryColor("#1976D2")
   .withSecondaryColor("#9C27B0")
   .withSidebarBackgroundColor("#1E1E2D")
   .withSidebarTextColor("#FFFFFF")
   .withFontFamily("Inter")
   .withBrandedHeaderEnabled(true)
   .withBrandedHeaderTagline("Acme Corp Portal"));
```

Fluent API. Discoverable. Type-safe.

How does that get to the frontend? Two options. Bake it into the build - generate CSS at compile time. But the frontend is built and packaged upstream as a static SPA. Downstream apps consume it as a dependency. They can't rebuild it with different colors.

So it has to be runtime. Send the theme with the metadata response. The frontend already fetches `/metaData` on load. Include the theme there. Each consuming app defines its own theme in Java, the frontend picks it up and applies it.

So the frontend gets a theme object. How do you apply it?

React context is one option - pass theme values down through providers. But every component needs to consume the context. That's a lot of changes. And it doesn't help with third-party components.

CSS-in-JS with a theme provider is another option. MUI supports this. But we're already fighting MUI's default styles. More abstraction isn't the answer.

CSS custom properties though. Set them once at the root:

```css
:root {
   --qqq-primary-color: #1976D2;
   --qqq-sidebar-background: #1E1E2D;
}
```

Reference them everywhere:

```css
.sidebar {
   background-color: var(--qqq-sidebar-background);
}
```

This cascades naturally. Set the variables, everything that uses them just works. No prop drilling. No context. No build step.

The frontend reads the theme from metadata, injects variables into the document root. Done.

The challenge is MUI. It has its own theming system, its own styled-components that inject styles at runtime with high specificity. CSS variables don't automatically win against that. Override styles are needed, with enough specificity to beat MUI's generated classes.

And there are multiple theming islands. The sidebar has its own colors - background, text, icons, hover states, selected states, dividers. The branded header has its own colors. Data tables have their own. They can't just inherit from global theme variables.

So we're looking at roughly 60 properties:

- Core palette: primary, secondary, background, surface, error, warning, success, info
- Typography: font family, sizes, weights for different variants
- Sidebar: background, text, icons, hover, selected, dividers
- Branded header: background, text, logo path, tagline
- Tables: header background, header text, row hover, borders
- General: border radius, spacing scale, density

Each one flows from Java to frontend to CSS to rendered component.

The infrastructure first - theme object flowing from backend to frontend, CSS variable injection. Then components one by one. Buttons, inputs, sidebar, tables.
