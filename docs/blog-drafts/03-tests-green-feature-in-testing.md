# 26 Tests Green

All green. Finally.

Pushed it to CI, watched the pipeline, held my breath... and it passed. 26 Playwright tests, all checking actual rendered colors on actual components. Not mocked. Not faked. Real browser, real CSS, real values.

Getting here was annoying though.

My first tests were wrong. Like, fundamentally wrong. They checked if the CSS variable was *set*:

```typescript
const cssVar = getComputedStyle(root).getPropertyValue('--qqq-primary-color');
expect(cssVar).toBe('#E91E63');
```

Those passed. Great, right? No. The button on screen was still the wrong color. The variable existed, the component just wasn't using it.

So I had to rewrite everything to check what actually renders:

```typescript
const btn = document.querySelector('.MuiButton-containedPrimary');
const bg = getComputedStyle(btn).backgroundColor;
```

If the button looks wrong, the test fails. That's the whole point.

## The Testing Architecture

Ended up with three test classes, each with a different purpose:

**ThemeIT** - CSS variable injection tests. Does the theme JSON get converted into `--qqq-*` variables? Simple, fast, catches the obvious stuff.

**ThemeComponentRenderingIT** - Component rendering tests. Given a sidebar with `sidebarBackgroundColor: '#1B5E20'`, does the MuiDrawer actually render green? This is where we catch the "variable exists but nothing uses it" problem.

**ThemeMuiComponentIT** - Strict MUI component tests. These are the brutal ones. They find the exact MUI element and assert the exact computed style. No fallbacks, no "well close enough."

```java
WebElement drawer = findElementOrFail(
   By.cssSelector(".MuiDrawer-paper"),
   "MUI Drawer (sidebar)"
);

String drawerBgColor = getComputedStyle(drawer, "background-color");
assertThat(normalizeColorToHex(drawerBgColor))
   .as("MUI Drawer sidebar MUST render with green background #1B5E20, but was %s", drawerBgColor)
   .isEqualToIgnoringCase("#1B5E20");
```

No silent skipping. `findElementOrFail` means if the element doesn't exist, the test fails with a clear message. Not "element not found," but "Could not find MUI Drawer (sidebar)."

## The Two-Server Setup

Tests run against a real React dev server and a mock Javalin backend. React on port 3001, Javalin on 8001. The mock serves JSON fixtures from `src/test/resources/fixtures/`.

Different fixtures for different test scenarios:
- `withFullCustomTheme.json` - all 60+ properties set
- `withCompactDensity.json` - compact spacing values
- `withBrandedHeader.json` - branded header enabled
- `index.json` - no theme, uses defaults

Each test picks its fixture, restarts Javalin, loads the page, runs assertions.

## The Color Comparison Problem

The annoying part was elements showing up in the wrong containers. I'd query for `.MuiTypography-body2` and find one - but it was in the sidebar, which has its own color scheme. Or in the branded header. Both of which should be *excluded* from the general text color rules.

So now every test does this dance:

```typescript
for (const el of allElements) {
   if (el.closest('.MuiDrawer-root')) continue;
   if (el.closest('.qqq-branded-header-bar')) continue;
   return getComputedStyle(el).color;
}
```

Loop through, skip the containers we don't want, grab the first valid one.

Oh and there was this one bug that took me way too long. Test output said:

```
expected #CFD8DC, got #CFD8DC
```

Same value. Still failing. What?

Turns out my color comparison function was trying to parse both as RGB, failing because they were hex, and returning false. I just needed to check if both start with `#` and compare directly. Twenty minutes I'll never get back.

```java
private String normalizeColorToHex(String color)
{
   if(color.startsWith("#"))
   {
      return color.toUpperCase();
   }

   if(color.startsWith("rgb"))
   {
      String numbers = color.replaceAll("[^0-9,.]", "");
      String[] parts = numbers.split(",");
      int r = Integer.parseInt(parts[0].trim());
      int g = Integer.parseInt(parts[1].trim());
      int b = Integer.parseInt(parts[2].trim());
      return String.format("#%02X%02X%02X", r, g, b);
   }
   return color.toUpperCase();
}
```

Browsers return computed colors as RGB. Theme fixtures use hex. Need to normalize both to the same format before comparing.

## What's Not Tested Yet

Hover and focus states are partially covered. We use JavaScript to dispatch mouse events:

```java
js.executeScript("arguments[0].dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));", item);
```

But it's flaky. The hover state might not apply before we read the style. There's a `waitForSeconds(1)` in there which is gross. Need a better way to verify CSS transitions complete.

Visual regression testing would catch things unit tests miss. Compare screenshots across builds, flag pixel differences. Tools like Percy or Chromatic do this. Worth exploring for the theme system specifically.

Cross-browser testing is another gap. These run in headless Chrome. Safari renders things slightly differently. Firefox has its own quirks. CI should probably run the suite against multiple browsers.

Accessibility testing for color contrast. If someone sets `textPrimary: '#CCCCCC'` on `backgroundColor: '#EEEEEE'`, that's technically valid but unreadable. Should probably warn about insufficient contrast ratios.

## Where This Goes Next

The test suite proves the theme system works. But it's testing qfmd in isolation. Downstream apps like me-health-portal have their own test suites. They pull qfmd as a dependency, apply their own theme, and their tests should verify the theming works in their context.

Right now other teams are pulling the snapshot to test in their apps. Real usage, real feedback. If something breaks, I'll hear about it.

Then docs. 60+ theme properties need to be documented somewhere. But that's a problem for next week.

[43522d6](https://github.com/QRun-IO/qqq-frontend-material-dashboard/commit/43522d6)
