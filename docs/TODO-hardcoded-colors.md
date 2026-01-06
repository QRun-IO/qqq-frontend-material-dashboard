# TODO: Convert Hardcoded Colors to CSS Variables

## Priority 1: Component Files (User-Facing)

### 1. Widget.tsx
**File:** `src/qqq/components/widgets/Widget.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 754 | `background: colors.info.main` | `background: "var(--qqq-info-color)"` |
| 772 | `background: colors.info.main` | `background: "var(--qqq-info-color)"` |

Remove `colors` import if no longer used.

---

### 2. ChartSubheaderWithData.tsx
**File:** `src/qqq/components/widgets/components/ChartSubheaderWithData.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 49 | `const GOOD_COLOR = colors.success.main;` | `const GOOD_COLOR = "var(--qqq-success-color)";` |
| 50 | `const BAD_COLOR = colors.error.main;` | `const BAD_COLOR = "var(--qqq-error-color)";` |

Remove `colors` import if no longer used.

---

### 3. FilterUtils.tsx
**File:** `src/qqq/utils/qqq/FilterUtils.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 608 | `background: "#0062FF"` | `background: "var(--qqq-info-color)"` |
| 609 | `background: "#757575"` | `background: "var(--qqq-grey-600, #757575)"` |
| 610 | `background: "#009971"` | `background: "var(--qqq-success-color)"` |

---

### 4. HorizontalBarChart.tsx
**File:** `src/qqq/components/widgets/charts/barchart/HorizontalBarChart.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 136 | `colors.info.main` | `"var(--qqq-info-color)"` |

Note: This is inside a chart config - verify CSS vars work in chart.js context.

---

### 5. CronUIWidget.tsx
**File:** `src/qqq/components/widgets/misc/CronUIWidget.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 861 | `color={colors.error.main}` | `color="var(--qqq-error-color)"` |

---

### 6. RowBuilderWidget.tsx
**File:** `src/qqq/components/widgets/misc/RowBuilderWidget.tsx`

| Lines | Current | Change To |
|-------|---------|-----------|
| 963-966 | `color: colors.error.main` (4 instances) | `color: "var(--qqq-error-color)"` |

All 4 lines are delete button hover states.

---

### 7. ShareModal.tsx
**File:** `src/qqq/components/sharing/ShareModal.tsx`

| Lines | Current | Change To |
|-------|---------|-----------|
| 482-485 | `color: colors.error.main` (4 instances) | `color: "var(--qqq-error-color)"` |

All 4 lines are delete button hover states.

---

## Priority 2: Bulk Load Components

### 8. BulkLoadFileMappingField.tsx
**File:** `src/qqq/components/processes/BulkLoadFileMappingField.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 64-67 | `color: colors.error.main` (4 instances) | `color: "var(--qqq-error-color)"` |
| 313 | `color={colors.warning.main}` | `color="var(--qqq-warning-color)"` |
| 319 | `color={colors.error.main}` | `color="var(--qqq-error-color)"` |

---

### 9. BulkLoadFileMappingForm.tsx
**File:** `src/qqq/components/processes/BulkLoadFileMappingForm.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 274 | `color={colors.error.main}` | `color="var(--qqq-error-color)"` |

---

### 10. BulkLoadValueMappingForm.tsx
**File:** `src/qqq/components/processes/BulkLoadValueMappingForm.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 220 | `color={colors.error.main}` | `color="var(--qqq-error-color)"` |

---

### 11. SavedBulkLoadProfiles.tsx
**File:** `src/qqq/components/misc/SavedBulkLoadProfiles.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 634 | `color={colors.success.main}` | `color="var(--qqq-success-color)"` |
| 637 | `color={colors.error.main}` | `color="var(--qqq-error-color)"` |

---

## Priority 3: Theme Components

### 12. tabs/index.ts
**File:** `src/qqq/assets/theme/components/tabs/index.ts`

| Line | Current | Change To |
|------|---------|-----------|
| 69 | `borderBottomColor: colors.info.main` | `borderBottomColor: "var(--qqq-info-color)"` |

---

### 13. flatpickr.ts
**File:** `src/qqq/assets/theme/components/flatpickr.ts`

| Line | Current | Change To |
|------|---------|-----------|
| 46 | `background: \`${gradients.info.state} !important\`` | `background: "var(--qqq-info-color) !important"` |

---

### 14. switchButton.ts
**File:** `src/qqq/assets/theme/components/form/switchButton.ts`

| Line | Current | Change To |
|------|---------|-----------|
| 68 | `backgroundImage: linearGradient(gradients.info.main, gradients.info.state)` | `backgroundImage: "linear-gradient(195deg, var(--qqq-info-color), var(--qqq-info-color-dark, var(--qqq-info-color)))"` |

---

## Priority 4: Legacy Components

### 15. MDBadgeDot/index.tsx
**File:** `src/qqq/components/legacy/MDBadgeDot/index.tsx`

| Lines | Current | Change To |
|-------|---------|-----------|
| 94 | `"primary": "#e91e63"` | `"primary": "var(--qqq-primary-color, #e91e63)"` |
| 97 | `"success": "#4CAF50"` | `"success": "var(--qqq-success-color, #4CAF50)"` |
| 98 | `"warning": "#fb8c00"` | `"warning": "var(--qqq-warning-color, #fb8c00)"` |
| 99 | `"error": "#F44335"` | `"error": "var(--qqq-error-color, #F44335)"` |

Note: Line 96 already uses `accentColor` which is correct.

---

### 16. MDProgressRoot.tsx
**File:** `src/qqq/components/legacy/MDProgress/MDProgressRoot.tsx`

| Line | Current | Change To |
|------|---------|-----------|
| 42 | `linearGradient(gradients.info.main, gradients.info.state)` | `"linear-gradient(195deg, var(--qqq-info-color), var(--qqq-info-color-dark, var(--qqq-info-color)))"` |

---

## Summary

| Priority | Files | Instances |
|----------|-------|-----------|
| P1: Components | 7 | ~15 |
| P2: Bulk Load | 4 | ~10 |
| P3: Theme | 3 | ~3 |
| P4: Legacy | 2 | ~5 |
| **Total** | **16** | **~33** |

## After Each Change

1. Remove unused `colors` import if file no longer uses it
2. Remove unused `gradients` import if file no longer uses it
3. Run `npm run build` to verify no TypeScript errors
4. Test visually that colors still appear correctly
