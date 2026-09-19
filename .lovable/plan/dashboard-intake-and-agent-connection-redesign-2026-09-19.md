# Dashboard intake and agent connection redesign

## Goal
Make the signed-in experience feel like the same premium product as the storefront, with an obvious supplement-taking flow, a readable journal, reliable mobile layouts, and a clear AI-agent connection path.

## What will change
- Replace **Supply** and **Settings** navigation with **Me**. The Me view will contain profile details in the expected order, current product inventory, purchase history, account actions, and agent connection status/setup.
- Make **Today** the primary action screen. Show each owned supplement with its real product image and category color, remaining servings, and a large one-tap **Take** control. A successful action immediately changes to **Taken**, decrements remaining inventory, and links to the corresponding Logbook day.
- Make **Logbook** a record rather than an action hub. Add month/week switching, clear activity markers, and a chronological selected-day journal containing supplement, meal, mood, and note entries.
- Remove the duplicate inventory panel from Logbook. Inventory appears once in Me and contextually beside each supplement on Today.
- Rebuild the Coach layout for mobile so the conversation scrolls independently and the composer stays fixed above the bottom navigation, respecting safe areas and the keyboard.
- Add an **Agent connection** section in Me explaining what connected assistants can do, with a direct OAuth connection action and clear connected/setup states. Keep the existing protected MCP tool catalog and validate its manifest.
- Replace generic product placeholders in dashboard content with the existing product photography and Morning/Focus/Evening visual accents.
- Eliminate dashboard horizontal overflow and clipped text at narrow widths; verify the key screens at the current phone size and desktop.

## Technical details
- Keep inventory derived as `purchased quantity × 30 − completed intake logs`; no duplicate inventory data is stored.
- Continue using local calendar dates for all daily records.
- Preserve the existing authenticated MCP server and OAuth consent route; update only user-facing discovery/setup and any tool context needed for inventory/reorder guidance.
- Use existing semantic color tokens and product assets. No logo work is included.

## Verification
- Take and undo a supplement, reload, and confirm the state, calendar marker, journal entry, streak, and inventory remain correct.
- Confirm month/week views select the same date and display all activity types.
- Test Today, Logbook, Coach, and Me at 393×852 with no horizontal scrolling or hidden composer.
- Regenerate and validate the MCP manifest after any MCP changes.
