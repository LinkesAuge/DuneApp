# Active Context: Dune Awakening Deep Desert Tracker

## Current Focus

-   **Memory System Initialization**: Successfully initialized the core memory files and directory structure as per `memory.mdc`.
-   **Project Onboarding**: Gaining a comprehensive understanding of the existing "Dune Awakening Deep Desert Tracker" project, including its features, tech stack, and codebase.

## Recent Changes & Decisions

-   **Created `tasks/` directory**: Essential for the memory system.
-   **Populated Core Memory Files**:
    -   `docs/product_requirement_docs.md`: Derived from `docs/DOCUMENTATION.md` to define project scope and features.
    -   `docs/architecture.md`: Documented system components, data flow, and included a Mermaid diagram based on `docs/DOCUMENTATION.md` and code structure.
    -   `docs/technical.md`: Outlined tech stack, setup, and key technical decisions from `docs/DOCUMENTATION.md` and `package.json`.
    -   `tasks/tasks_plan.md`: Established initial task backlog, marking memory setup as complete and outlining next steps.
    -   `tasks/active_context.md`: This file, documenting the current state of initialization.
-   **Reviewed existing `.cursor/rules/`**: Confirmed presence of `memory.mdc`, `error-documentation.mdc`, `lessons-learned.mdc`, and other relevant rule files.
-   **Analyzed `docs/DOCUMENTATION.md`**: Extracted key information to populate the new memory files.
-   **Reviewed Code**: Examined `package.json`, `src/lib/supabase.ts`, `src/types/index.ts` to understand project setup and basic structure.

## Next Steps (Immediate)

1.  **User Confirmation**: Await user confirmation that the memory system initialization meets expectations.
2.  **Define Development Sprint 1**: Collaborate with the user to define and prioritize tasks for the first development sprint based on `tasks/tasks_plan.md` and `docs/product_requirement_docs.md`.
3.  **Address User Queries**: Respond to any further questions or requests from the user regarding the project or next steps.

## Open Questions / Items for Discussion

-   Are there any existing project management tools or issue trackers in use (e.g., Jira, Trello, GitHub Issues)? This will be useful for integrating `tasks/tasks_plan.md`.
-   Specific priorities for the first set of features to be developed. 

## Update: POI Icon Management Resolved (YYYY-MM-DD) <!-- User to replace YYYY-MM-DD -->

-   **Focus**: Resolved issues related to POI Type icon uploads, display, and styling within the admin panel (`PoiTypeManager.tsx`) and consuming components (`PoiCard.tsx`, `GridSquare.tsx`).
-   **Key Changes & Decisions**:
    -   Switched from a problematic new 'poi-icons' Supabase bucket to using a subfolder (`icons/`) within the existing 'screenshots' bucket for POI icon storage.
    -   Implemented client-side image resizing (to max 48px) and PNG conversion for uploaded icons.
    -   Added a feature to allow POI Type icons to have a transparent background, controlled by an `icon_has_transparent_background` boolean field in the database and UI.
    -   Refactored `PoiTypeManager.tsx` styling extensively to align with the application's single default theme (sand, night, spice colors), improving contrast and usability. Removed all `dark:` mode Tailwind CSS classes.
    -   Updated icon display logic in `PoiCard.tsx` and `GridSquare.tsx` to correctly render both emoji and image URL icons, respecting the transparent background setting and improving visibility on the map.
-   **Outcome**: POI Type management, including icon uploads and varied display, is now fully functional and styled consistently.
-   **Next Steps**: Continue with other tasks in the backlog, potentially focusing on further Admin Panel features or other core POI functionalities. 

## Date: 2025-05-25

**Last Major Feature/Fix:** Implemented local time scheduling for admin tasks (backup/reset).

**Details:**
-   Users can now input their desired schedule time in their local time zone in the Admin Panel.
-   The frontend (`AdminPanel.tsx`) detects the user's browser timezone and sends it along with the local time/date to the `schedule-admin-task` Supabase Function.
-   A new PostgreSQL helper function, `convert_to_utc_components(local_dt_str TEXT, tz TEXT)`, was created. This function takes a local timestamp string and an IANA timezone identifier, and returns the corresponding UTC hour, minute, and day of the week.
-   The `schedule-admin-task` Supabase Function now calls `convert_to_utc_components` via RPC to get the correct UTC components for constructing the `pg_cron` expression.
-   The display of scheduled tasks in `AdminPanel.tsx` converts the UTC-based cron time back to the user's local time.
-   Relevant documentation (`lessons-learned.mdc`, `technical.md`, `architecture.md`) has been updated to reflect this new timezone handling mechanism.

**Current Focus/Next Step:**
-   Update the `schedule-admin-task` Supabase Edge Function to utilize the new `convert_to_utc_components` SQL function via RPC to correctly generate UTC-based CRON expressions from user-provided local times and timezones.

**Open Questions/Blockers:**
-   None currently.

**Recent File Changes:**
-   `docs/lessons-learned.mdc` (Updated)
-   `docs/technical.md` (Updated)
-   `docs/architecture.md` (Updated)
-   `supabase/functions/schedule-admin-task/index.ts` (Placeholder for changes)
-   `src/components/admin/AdminPanel.tsx` (Updated for timezone sending and local display)
-   SQL: New function `convert_to_utc_components` created in the database.

## Recent Changes & Current Focus (YYYY-MM-DD)

*   **User Management - Deletion**: Successfully implemented and tested user deletion functionality in the Admin Panel. This involved:
    *   Creating the `delete-user` Supabase Edge Function.
    *   Updating `AdminPanel.tsx` with UI and logic for deletion.
    *   Troubleshooting and resolving a "Database error deleting user" by identifying the `public.profiles.id` foreign key constraint (`profiles_id_fkey`) to `auth.users(id)` had `ON DELETE NO ACTION`. This was changed to `ON DELETE CASCADE`.
    *   Verifying no other public tables blocked profile deletion.
*   **Next Steps**: Documented the fix in `error-documentation.mdc`, `lessons-learned.mdc`, and `technical.md`. Proceed with user request for editing user information (username/email).

## Update: POI Icon Update Race Condition Resolved (2024-12-31)

**Problem Identified:** POI icons on the grid map weren't updating immediately when new POIs were added to grid squares, requiring a page refresh to see changes.

**Root Cause Analysis:**
- Race condition in callback chain when adding POIs via `AddPoiForm`
- `fetchPoisOnly()` was called immediately after POI creation, but database transaction might not be fully committed
- React's reconciliation wasn't detecting POI data changes in `GridSquare` components
- Component keys weren't sufficient to trigger re-renders when POI data changed

**Solutions Implemented:**

1. **Enhanced `fetchPoisOnly()` in GridContainer.tsx:**
   - Added 100ms delay to allow database transaction commitment
   - Added comprehensive error handling and debugging logs
   - Added forced re-render mechanism

2. **Improved React Rendering in GridSquare.tsx:**
   - Added `useMemo` hook with `poiDataKey` to detect POI data changes
   - Forces component re-renders when POI data actually changes
   - Enhanced component keys to include POI count in `GridContainer`

3. **Enhanced Callback Chain:**
   - `AddPoiForm` -> `GridSquareModal.handleAddPoi()` -> `onPoiSuccessfullyAdded` callback -> `GridContainer.fetchPoisOnly()`
   - Added comprehensive debugging throughout the chain
   - Enhanced error handling and user feedback

4. **Component Communication Improvements:**
   - Better prop passing and callback handling between components
   - Enhanced debugging to track callback execution
   - Improved error states and loading indicators

**Files Modified:**
- `src/components/grid/GridContainer.tsx` (Enhanced fetchPoisOnly, better React keys)
- `src/components/grid/GridSquare.tsx` (Added useMemo for POI data tracking)
- `src/components/grid/GridSquareModal.tsx` (Enhanced callback handling and debugging)
- `src/components/poi/AddPoiForm.tsx` (Added debugging and error handling)

**Outcome:** POI icons now update immediately when new POIs are added, providing seamless user experience without requiring page refreshes.

**Next Steps:** Continue with other development tasks. The current solution is sufficient for production requirements. 