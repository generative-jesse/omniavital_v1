# Dashboard, logging, and inventory redesign

## What will change
- Rework the signed-in shell into a premium navigation layout inspired by the supplied dashboard mock, replacing the crowded top tab row with clear desktop navigation and compact mobile navigation.
- Rebuild the logging view around a clean calendar and a selected-day timeline, with unambiguous activity markers, visible log counts, clear ritual status, and better empty/loading/error states.
- Connect purchases to inventory: each purchased bottle adds 30 servings, each completed ritual log consumes one serving, and remaining inventory is visible in the dashboard and purchase history.
- Fix “Add to Ritual” permissions and feedback, then ensure the agent can read remaining inventory and warn or recommend a reorder when stock reaches zero.
- Refresh the logo and typography to match the light, botanical monogram and restrained premium typography in the supplied reference.

## Interaction details
- Selecting a calendar day immediately shows every ritual, diet, mood, and journal entry for that date.
- Calendar markers use teal and neutral status treatments only; the selected day will no longer use yellow.
- Ritual rows show remaining servings and disable impossible intake logging when no purchased inventory remains, while preserving historical logs.
- Mobile keeps the calendar, date summary, and entry actions reachable without horizontal overflow.

## Technical details
- Inventory is derived from purchase quantity × 30 minus completed ritual logs per product, avoiding duplicated stock state.
- Existing row-level privacy remains intact; purchase creation is limited to the signed-in member.
- MCP purchase and daily-log tools will return remaining servings and explicit reorder context.
- The updated interface will be checked in authenticated desktop and mobile previews, plus build and security checks.
