# Active Context: Dune Awakening Deep Desert Tracker

## Current Focus

-   **Memory System Initialization**: Successfully initialized the core memory files and directory structure as per `memory.mdc`.
-   **Project Onboarding**: Gaining a comprehensive understanding of the existing "Dune Awakening Deep Desert Tracker" project, including its features, tech stack, and codebase.
-   **Comment System Development**: Preparing to implement a comprehensive comment system for POIs and grid squares to enhance community collaboration and information sharing.
-   **Post-Filter Alignment Phase**: Recently completed major UI/UX improvements for filter consistency across the application.

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

## Recent Changes & Decisions (2025-01-01)

### Filter System Alignment & UI Consistency (Completed)

**Achievement**: Successfully unified the filtering experience between POI page and grid map for seamless user navigation.

**Key Accomplishments**:

1. **Grid Map Filter Modernization (`src/components/filters/GridFilter.tsx`)**:
   - Replaced custom styling (`px-3 py-1 text-xs rounded-full` with custom colors) with standardized `btn` component classes
   - Updated category buttons to use `btn text-xs px-2 py-1` with proper `btn-primary`/`btn-outline` states
   - Applied consistent styling to POI type buttons and clear filters functionality
   - Enhanced accessibility and visual consistency across the interface

2. **POI Page Filter Restructuring (`src/pages/PoisPage.tsx`)**:
   - Reimplemented filter structure to match grid map's category-based grouping approach
   - Simplified complex conditional logic for type grouping, improving maintainability
   - Added proper handling for uncategorized POI types
   - Removed unused computed values (`availablePoiTypesForTagging`) for cleaner code

3. **Visual Harmony Improvements**:
   - **Background Consistency**: Aligned filter section backgrounds (`bg-sand-50`) between both interfaces
   - **Color Unification**: Updated title colors from `text-night-800` to `text-sand-800` and subtitle colors from `text-night-700` to `text-sand-600`
   - **Design Language**: Established unified visual hierarchy and styling patterns across all filter components

**Impact**: Users now experience consistent filtering behavior and visual design across all application interfaces, significantly reducing cognitive load and improving overall user experience.

**Files Modified**:
- `src/components/filters/GridFilter.tsx` - Complete styling overhaul and structure improvements
- `src/pages/PoisPage.tsx` - Filter logic restructuring and visual consistency updates

## Next Steps (Immediate Priority)

### Comment System Implementation - Phase 1

1. **Database Schema Design & Migration**:
   - Create `poi_comments` table with relationships to POIs and users
   - Create `grid_comments` table for grid square discussions
   - Implement proper foreign key constraints with CASCADE delete policies
   - Design comment threading system with parent-child relationships
   - Add performance indexes for efficient comment queries

2. **Row Level Security (RLS) Policies**:
   - Define security policies for comment creation, viewing, editing, and deletion
   - Implement role-based access for admin moderation capabilities
   - Ensure proper user isolation and data protection

3. **Core Component Development**:
   - Develop `CommentForm.tsx` for creating and editing comments
   - Create `CommentItem.tsx` for individual comment display with user info and timestamps
   - Build `CommentsList.tsx` container with pagination and sorting functionality

## Open Questions / Items for Discussion

1. **Comment Moderation Strategy**: What level of moderation should be implemented initially? Should there be auto-moderation features or purely manual admin review?

2. **Real-time vs. Polling**: Should comment updates use Supabase real-time subscriptions for immediate updates, or would periodic polling be sufficient initially?

3. **Comment Depth Limits**: How many levels of threading should be allowed for replies to prevent overly deep nested conversations?

4. **User Notification System**: Should users receive notifications for replies to their comments? If so, in-app only or email notifications as well?

## Development Environment Status

- **Local Development**: Running on `localhost:5175` with Vite dev server
- **Database**: Supabase PostgreSQL with current schema including profiles, grid_squares, pois, poi_types
- **Authentication**: Supabase Auth with role-based access control fully functional
- **Storage**: Supabase Storage with screenshots bucket for POI images and grid screenshots
- **Current User**: Active authenticated session for development and testing

## Technical Context for Comment System

### Existing Architecture Integration Points

1. **POI Integration**: Comments will be integrated into:
   - `PoiCard.tsx` components for quick comment previews
   - `GridSquareModal.tsx` for detailed POI discussions
   - `PoisPage.tsx` for comprehensive comment management

2. **Grid Square Integration**: Comments will be accessible through:
   - `GridSquareModal.tsx` for location-specific discussions
   - Grid overview interfaces for community activity indicators

3. **Admin Integration**: Comment management will be added to:
   - Admin Panel for moderation tools
   - User management interfaces for comment-related user actions

### Data Flow Design

```
User Input → CommentForm → Supabase Client → Database
Database → Real-time Subscriptions → CommentsList → UI Update
```

### Component Hierarchy Plan

```
GridSquareModal / PoiCard
├── CommentsList
│   ├── CommentItem
│   │   ├── CommentReplies (nested)
│   │   └── User Actions (edit/delete/reply)
│   └── Pagination Controls
└── CommentForm (create new comment)
```

## Recent Memory Updates

All core memory files have been updated to reflect:
- Completed filter alignment achievements
- Updated project status and technical implementations
- Comment system architecture planning
- Enhanced feature roadmap with prioritized enhancements
- Current development focus and next steps

**Updated Files**:
- `docs/product_requirement_docs.md` - Added comment system features and UI consistency requirements
- `docs/architecture.md` - Documented filter alignment implementation and comment system design
- `tasks/tasks_plan.md` - Updated project status and comprehensive task breakdown
- `tasks/active_context.md` - This file, reflecting current development state 