# System Architecture: Dune Awakening Deep Desert Tracker

## 1. Overview

The Dune Awakening Deep Desert Tracker is a web application built with React (TypeScript) on the frontend and Supabase for backend services (Authentication, Database, Storage). The application allows users to track exploration data on a grid-based map of Dune Awakening's deep desert region.

## 2. Components and Layers

```mermaid
flowchart TD
    subgraph "User Interface (React + Tailwind CSS)"
        direction LR
        A[Auth Components] --> P
        G[Grid Map Components] --> P
        POI_C[POI Management Components] --> P
        ADM[Admin Panel Components] --> P
        P[Pages]
    end

    subgraph "Frontend Logic (TypeScript)"
        direction LR
        R[React Router v6] --> S
        S[State Management (React Context/Hooks)]
        U[Utility Functions (src/lib)]
        T[Type Definitions (src/types)]
    end

    subgraph "Backend Services (Supabase)"
        direction LR
        SB_Auth[Supabase Auth] --> DB
        SB_DB[Supabase Database (PostgreSQL)] --> DB
        SB_Store[Supabase Storage] --> DB
        EF[Edge Functions]
        DB[Database Schema]
    end

    P --> S
    S --> SB_Auth
    S --> SB_DB
    S --> SB_Store
    S --> EF
    U --> S
    T -- used by --> P
    T -- used by --> S

    classDef supabase fill:#3ecf8e,stroke:#333,stroke-width:2px,color:#fff;
    class SB_Auth,SB_DB,SB_Store,EF,DB supabase;

    classDef react fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000;
    class A,G,POI_C,ADM,P,R,S,U,T react;

    AdminPanel --o|Calls| schedule-admin-task : Schedule Task (local time, timezone)
    schedule-admin-task --o|RPC| postgresql_db : Calls convert_to_utc_components(local_time, timezone)
    postgresql_db --o|Returns UTC H,M,DOW| schedule-admin-task
    schedule-admin-task --o|RPC schedule_cron_job| postgresql_db : (job_name, UTC_CRON_EXPR, command)
    postgresql_db --|> pg_cron : Stores & Executes Job
    pg_cron --o|HTTP POST| perform_map_backup : Executes Backup
    pg_cron --o|HTTP POST| perform_map_reset : Executes Reset (optional backup)
```

### 2.1. Frontend (Client-Side)

-   **Presentation Layer (src/components, src/pages)**:
    -   Built with React 18 and TypeScript.
    -   Uses Tailwind CSS for styling.
    -   Lucide React for icons.
    -   Components are organized into: `admin`, `auth`, `common`, `grid`, `poi`.
    -   `pages/` directory contains top-level page components.
-   **Application Logic (src/lib, src/types, React Hooks/Context)**:
    -   React Router v6 for client-side routing.
    -   State management likely handled by React Context API and hooks.
    -   `src/lib/supabase.ts` configures the Supabase client.
    -   `src/types/index.ts` defines TypeScript interfaces for data structures.

### 2.2. Backend (Server-Side - Supabase)

-   **Supabase Auth**:
    -   Handles user authentication (signup, signin).
    -   Manages user roles and sessions.
-   **Supabase Database (PostgreSQL)**:
    -   Stores application data:
        -   `profiles`: User profiles and roles.
        -   `grid_squares`: Grid map data and screenshot metadata.
        -   `poi_types`: POI categories and types.
        -   `pois`: Point of Interest data.
    -   Row Level Security (RLS) policies are enforced on all tables.
    -   Database migrations are located in `/supabase/migrations/`.
-   **Supabase Storage**:
    -   `screenshots` bucket: Stores grid square screenshots (public read, authenticated upload, user-specific delete). Also stores POI type icons in an `icons/` subfolder (public read, admin/editor upload/delete).
    -   `poi-icons` bucket: Stores POI type icons (public read, admin/editor upload/delete).  *DEPRECATED in favor of `screenshots/icons/` due to access issues.*
-   **Supabase Edge Functions (located in `/supabase/functions/`)**:
    -   `manage-database`: Handles database operations (backup, restore, reset map data).
    -   `get-user-emails`: Admin-only function for retrieving user email addresses.

## 3. Data Flow

1.  **User Interaction**: User interacts with React components in their browser.
2.  **API Calls**: Frontend components make calls to Supabase services (Auth, Database, Storage, Edge Functions) via the Supabase client library.
3.  **Authentication**: Supabase Auth verifies user credentials and manages sessions. User roles determine access to features and data.
4.  **Data Operations**: CRUD (Create, Read, Update, Delete) operations on the Supabase Database are performed according to RLS policies.
5.  **File Storage**: Screenshots and icons are uploaded to/retrieved from Supabase Storage, respecting bucket policies.
6.  **Edge Functions**: Specific backend logic (e.g., database management) is executed via serverless Edge Functions.

## 4. Key Architectural Decisions

-   **Serverless Backend**: Leveraging Supabase for BaaS (Backend as a Service) reduces server management overhead.
-   **Component-Based UI**: React promotes modular and reusable UI components.
-   **TypeScript**: Static typing for improved code quality and maintainability.
-   **Tailwind CSS**: Utility-first CSS for rapid UI development and consistent styling.
-   **Role-Based Access Control (RBAC)**: Enforced at multiple levels (frontend UI, Supabase RLS) for security.

## 5. Directory Structure (Key Areas)

-   `src/`: Contains all frontend source code.
    -   `components/`: Reusable React components, categorized by feature.
    -   `lib/`: Utility functions, Supabase client configuration.
    -   `pages/`: Top-level page components for routing.
    -   `types/`: TypeScript type definitions.
-   `supabase/`: Contains backend configurations for Supabase.
    -   `functions/`: Edge Function code.
    -   `migrations/`: Database schema migrations.

## 6. Current Workflow (High-Level - Example: Adding a POI)

1.  User logs in (Supabase Auth).
2.  User navigates to a grid square on the map (React Router, Grid components).
3.  User clicks "Add POI" (POI components).
4.  Frontend form captures POI details (title, type, description, screenshots).
5.  On submission, frontend calls Supabase client to:
    a.  Upload POI screenshots to Supabase Storage (`screenshots` bucket).
    b.  Insert new POI record into `pois` table in Supabase Database (respecting RLS).
6.  UI updates to reflect the newly added POI. 

## 7. POI Type Management Specifics

-   **Icon Storage**: POI Type icons (emojis or uploaded images) are managed via `PoiTypeManager.tsx`.
    -   Uploaded icons are resized client-side (max 48px) and converted to PNG.
    -   Icons are stored in the `screenshots` Supabase Storage bucket, under an `icons/` subfolder.
-   **Transparent Backgrounds**: POI Types have an `icon_has_transparent_background` boolean flag.
    -   If true, and the icon is an image URL, the POI type's `color` property is not used as a background for the icon in displays like `PoiCard.tsx` and `GridSquare.tsx`.

## POI Display and Interaction (PoisPage, GridSquareModal, GridGallery)

- **Data Flow for POI Details**: `PoisPage` fetches all POIs and their associated `grid_square` data, creating `PoiWithGridSquare` objects. 
  - Clicking a `PoiCard` or `PoiListItem` on `PoisPage` sets `selectedPoi` and `selectedGridSquare`, opening `GridSquareModal`.
  - `GridSquareModal` displays details of the `selectedGridSquare` and lists its associated POIs (fetched internally by the modal based on `currentSquare.id`).

- **POI-Specific Gallery Opening**: 
  - A consistent `handleGalleryOpen(poi)` function in `PoisPage` is used to manage the state for displaying `GridGallery` with a specific POI's screenshots.
  - This function is passed as `onImageClick` to `PoiCard` and `PoiListItem` on `PoisPage` for direct gallery access.
  - It's also passed as `onPoiGalleryOpen` to `GridSquareModal`.
  - `GridSquareModal` then passes this `onPoiGalleryOpen` to its internal `PoiList`.
  - `PoiList` uses `onPoiGalleryOpen` for the `onImageClick` event of `PoiCard`s it renders, allowing gallery opening from the list within the modal.
  - The main image of `GridSquareModal` (when the modal is opened from `PoisPage`) also uses an `onImageClick` prop (wired in `PoisPage`) to trigger `handleGalleryOpen` for the initially selected POI.

- **Modal Stacking and Closure (GridSquareModal & GridGallery)**:
  - `GridSquareModal` has a "click outside" listener (`handleClickOutside`) attached to `document` (`mousedown`) to close itself.
  - `GridGallery` is an overlay. To prevent clicks on `GridGallery` (backdrop or its own close button) from also closing `GridSquareModal`, the following measures are in place:
    - `GridGallery`'s backdrop and "X" button click handlers call `event.stopPropagation()`.
    - `GridSquareModal`'s `handleClickOutside` function includes a specific check: if the `event.target` of the `mousedown` is part of the `GridGallery` structure (identified by CSS classes `div[class*="bg-night-950/90"][class*="z-[60"]`), it ignores the event and does not close itself. This ensures `GridGallery` can be closed without affecting the underlying `GridSquareModal`. 

### Scheduled Tasks Timezone Handling

To allow administrators to schedule tasks (like backups and resets) in their local time, the following process is used:

1.  **Frontend (`AdminPanel.tsx`)**: Collects the desired local time, date, and frequency. It also detects the user's browser IANA timezone identifier (e.g., "Europe/Berlin"). These details are sent to the `schedule-admin-task` Supabase Function.
2.  **Supabase Function (`schedule-admin-task`)**: 
    *   Receives the local time, date, frequency, and the user's timezone.
    *   It calls the PostgreSQL helper function `convert_to_utc_components` via RPC, passing the local date/time string (e.g., "YYYY-MM-DD HH:MM:SS") and the IANA timezone.
3.  **PostgreSQL Function (`convert_to_utc_components`)**: 
    *   Takes the local timestamp string and the IANA timezone identifier.
    *   Uses PostgreSQL's internal timezone conversion capabilities (`AT TIME ZONE`) to convert the local timestamp to its equivalent UTC. 
    *   Extracts and returns the UTC hour, UTC minute, and UTC day of the week (0 for Sunday, compatible with `pg_cron`).
4.  **Supabase Function (`schedule-admin-task`)**: 
    *   Receives the UTC components from the SQL function.
    *   Constructs a UTC-based CRON expression.
    *   Schedules the job with `pg_cron` using another RPC call to `schedule_cron_job`.
5.  **Display**: When fetching and displaying scheduled tasks, the UTC time components derived from the cron job are converted back to the user's local time in the `AdminPanel.tsx` for a consistent user experience.

This approach ensures that `pg_cron` (which operates on UTC) correctly schedules tasks according to the user's local time intention, handling complexities like Daylight Saving Time (DST) via PostgreSQL's robust timezone engine.

## Data Storage and Management

-   **Grid Square Data**: `grid_squares` table stores grid map data and screenshot metadata.
-   **POI Data**: `pois` table stores point of interest data.
-   **Screenshot Storage**: `screenshots` bucket stores grid square screenshots and POI type icons.
-   **Scheduled Tasks**: `pg_cron` schedules and executes tasks like backups and resets.
-   **User Profiles**: `profiles` table stores user profiles and roles.
-   **Edge Functions**: Supabase Edge Functions handle specific backend logic.
-   **Database Schema**: Supabase Database schema includes tables for profiles, grid squares, POI types, and POIs.
-   **Supabase Auth**: Manages user authentication and sessions.
-   **Supabase Storage**: Stores screenshots and icons.
-   **Supabase Edge Functions**: Handles edge logic like scheduled tasks.
-   **PostgreSQL**: Stores and manages data, executes scheduled tasks, and handles timezone conversions.
-   **pg_cron**: Executes scheduled tasks like backups and resets.

This architecture ensures efficient data storage, secure access, and reliable task execution, providing a robust backend foundation for the Dune Awakening Deep Desert Tracker. 