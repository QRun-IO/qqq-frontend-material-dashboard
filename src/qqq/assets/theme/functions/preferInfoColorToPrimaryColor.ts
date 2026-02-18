
/***************************************************************************
 * The original version of this app had the "primary" color set to a bright
 * red/fuchsia/pink tone (#E91E63).  So, whenever we would try to add something
 * that might have made sense to use "primary" color, we'd see that tone that
 * we didn't like, and we'd use "info" instead - a nice blue.
 *
 * But now, with the backend-provided themes, apps might set their primary
 * color to something like, let's say teal, and the expectation is to make a
 * lot of things like the new & save buttons be that primary color.
 *
 * But, we don't want to make "info" that teal tone - it should be blue
 * (e.g,. for an info alert or icon - blue for info is the expectation).
 *
 * So the mistake we made all along I think was using "info" instead of
 * "primary" in lots of UI elements that we added.
 *
 * To preserve backward compatibility as much as possible, while also changing
 * some elements from "info" to "primary", then here's what I've come up with
 * as an approach:
 *
 * 1. Define a CSS variable on `:root`called `--qqq-prefer-info-color-to-primary-color`.
 *   (which flows from MaterialDashboardThemeMetaData.preferInfoColorToPrimaryColor)
 *   - If this variable is 1, then places that /should/ have used "primary"
 *     all along would instead still use "info".  We'd set that to 1 to
 *     maintain backward-compatibility (e.g., so the create-new button would
 *     still be info-blue, not primary-fuchsia).
 *   - But then, an app can override that value to `0`, to say "no no, don't
 *     prefer info - instead, use primary where it would have made sense
 *     (but you just didn't want that fuchsia color)".  So an app could set
 *     MaterialDashboardThemeMetaData.preferInfoColorToPrimaryColor to false,
 *     or set `--qqq-prefer-info-color-to-primary-color: 0` in their custom CSS
 *     so its create new button would be primary (e.g., teal as mentioned above),
 *     not info-blue.
 *
 * 2. Define a family of functions (e.g., this file) that, based on that css
 *    variable, either output `"info"` or `"primary"`; or `var(--qqq-info-color)`
 *    or `var(--qqq-primary-color)`, or the hard-coded fallbacks for info & primary
 *
 * 3. Update components that are using `"info"` (or `--qqq-info-color`
 *    (or `var(--qqq-info-color, "#0062FF")`)) to call the appropriate
 *    `preferredInfoOrPrimaryXXX` function.  I don't think this is a
 *    "change them all" scenario (because info should still be used where it's
 *    intention is truly 'info'), but, i'm not sure entirely which ones
 *    it should be... my current list looks like:
 *    A. Create-New and Save buttons in DefaultButtons.tsx
 *    B. icon backgrounds on app home screens (Home.tsx)
 *    C. progress bar background on processes (ProcessRun.tsx usage of Stepper)
 *    D. the little pagination buttons on the bottoms of like the TableData widget
 ***************************************************************************/

/***************************************************************************
 * private function used by other functions in here to decide if the info
 * color is preferred over the primary color, based on the css variable
 * --qqq-prefer-info-color-to-primary-color being equal to 1 or not.
 *
 * 1 = prefer info color; anything else = prefer primary color
 *
 * Legacy behavior was to always prefer info color; Apps setting their own
 * primary color may want to use their primary color for more UI elements,
 * and set that css var to 0.
 ***************************************************************************/
function preferInfoColorToPrimaryColor(): boolean {
   return getComputedStyle(document.body).getPropertyValue('--qqq-prefer-info-color-to-primary-color') == "1";
}

/***************************************************************************
 * private function that, based on the value of preferInfoColorToPrimaryColor(),
 * returns the hex code for either the default info color (a blue), or the
 * default primary color (a red/fuchsia).
 ***************************************************************************/
function preferredDefaultColorInfoOrPrimary(): string {
   return preferInfoColorToPrimaryColor() ? "#0062FF" : "#E91E63";
}

/***************************************************************************
 * public function that returns either "info" or "primary" based on the
 * value of preferInfoColorToPrimaryColor().
 *
 * So elements that should probably be displayed in the primary color (e.g.,
 * primary action buttons on screens, or some UI decorations), they can use
 * this function to get their color name - but - if the primary is undesirable,
 * then the info color (default blue) can be used instead.
 ***************************************************************************/
export function preferredColorNameInfoOrPrimary(): "info" | "primary" {
   return preferInfoColorToPrimaryColor() ? "info" : "primary";
}

/***************************************************************************
 * public function that returns a css var(--qqq...color, #default) expression,
 * based on the value of preferInfoColorToPrimaryColor().
 *
 * For use-cases similar to preferredColorNameInfoOrPrimary(), but where we
 * need a CSS value, not a color name for MUI to interpret.
 ***************************************************************************/
export function preferredInfoOrPrimaryColorVarExpression(): string {
   return `var(--qqq-${preferredColorNameInfoOrPrimary()}-color, ${preferredDefaultColorInfoOrPrimary()})`;
}
