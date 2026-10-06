# Logbook polish and trends

## Goal
Make the Logbook easier to use at a glance: logging first, history second, with meaningful trends from existing health data.

## Changes
- Move the Meal, Mood, and Note entry controls above the calendar and selected-day history so the primary action is immediately visible.
- Remove the duplicate inventory block from Logbook; inventory remains in Me and supplement intake remains in Today.
- Add a compact Trends section using real saved data:
  - 14-day mood and energy trend when scored entries exist.
  - 28-day activity heatmap combining supplement, food, mood, and journal activity.
  - Clear empty states rather than invented data.
- Refine the calendar and selected-day layout for clearer hierarchy and narrow-phone fit.
- Keep the selected date synchronized across logging, calendar dots, and day history after every save.

## Technical details
- Reuse the existing chart component and Recharts package.
- Fetch mood scores and energy for the visible trend range; no database changes.
- Weight is not charted yet because the product has no weight log data model. This avoids presenting fabricated health data.
- Verify the Logbook at desktop and narrow mobile widths, including overflow and saving a new entry.
