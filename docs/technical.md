# Technical Documentation: Dune Awakening Deep Desert Tracker

## 1. Technology Stack

-   **Frontend Framework**: React 18
-   **Programming Language**: TypeScript
-   **Backend-as-a-Service (BaaS)**: Supabase
    -   Authentication: Supabase Auth (Email/Password, Role-based)
    -   Database: Supabase PostgreSQL
    -   Storage: Supabase Storage (for images/icons)
    -   Edge Functions: Supabase Functions (for server-side logic like DB management)
-   **Styling**: Tailwind CSS
-   **UI Components**: Custom components, potentially leveraging Radix UI primitives if Shadcn UI is considered later.
-   **Icons**: Lucide React
-   **Routing**: React Router v6
-   **Build Tool**: Vite
-   **Package Manager**: npm (version 9+ implied by docs)
-   **Version Control**: Git (assumed)

## 2. Development Environment Setup

### 2.1. Prerequisites
-   Node.js: Version 18+ (as specified in `docs/DOCUMENTATION.md`)
-   npm: Version 9+ (as specified in `docs/DOCUMENTATION.md`)
-   A Supabase project.

### 2.2. Getting Started

1.  **Clone the repository** (assuming it's hosted on a Git platform).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    Create a `.env` file in the project root with the following variables (obtain values from your Supabase project):
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application should now be accessible, typically at `http://localhost:5173` (Vite default).

### 2.3. Build Commands

-   **Development**: `npm run dev`
-   **Production Build**: `npm run build` (compiles TypeScript and bundles assets into `dist/`)
-   **Preview Production Build**: `npm run preview` (serves the `dist/` directory locally)
-   **Linting**: `npm run lint` (uses ESLint with TypeScript plugins)

## 3. Key Technical Decisions & Patterns

-   **Supabase for Backend**: Simplifies backend development by providing integrated auth, database, and storage. This is a core decision influencing data management and security.
-   **TypeScript**: Enforces static typing, improving code maintainability, reducing runtime errors, and enhancing developer experience, especially for a growing codebase.
-   **Tailwind CSS**: Utility-first approach allows for rapid UI development and easy customization while maintaining consistency. The desert-themed palette (Sand, Spice, Sky, Night) and specific fonts (Orbitron, Inter) are defined within its configuration.
-   **Vite as Build Tool**: Offers fast HMR (Hot Module Replacement) for development and optimized builds for production.
-   **Supabase Database Extensions**:
    -   `pg_cron`: Used for scheduling tasks (e.g., map backups, resets). Managed via Supabase dashboard or SQL.
    -   `pg_net`: **Required** for `pg_cron` to make outbound HTTP requests, which is how it triggers Supabase Edge Functions. Must be enabled via SQL (`CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;`) if not available in the dashboard.
-   **Component-Based Architecture (React)**: Promotes reusability and modularity. Components are organized by feature (admin, auth, common, grid, poi) in `src/components/`.
-   **Client-Side Routing (React Router v6)**: Enables a single-page application (SPA) experience.
-   **Environment Variables for Configuration**: Supabase keys are managed via `.env` files, separating configuration from code.
-   **Database Migrations**: Schema changes and initial data seeding are managed via files in `/supabase/migrations/`, ensuring consistent database states across environments.
-   **Edge Functions for Secure Operations**: Sensitive or privileged operations like database management (`manage-database` function) are handled by Supabase Edge Functions, callable from the frontend but executed securely on the server.

## 4. Styling and UI

-   **Color Palette**:
    -   Sand: Earth tones (backgrounds, containers)
    -   Spice: Orange/red accents (primary actions)
    -   Sky: Blue tones (interactive elements)
    -   Night: Dark tones (text, borders)
-   **Typography**:
    -   Display Font: Orbitron (headers, titles)
    -   Body Font: Inter (general text)
-   **Component Libraries**:
    -   Currently uses custom components with Lucide React for icons.
    -   Future consideration for Shadcn UI or Radix UI primitives is noted by the `ui-ux` rule.
-   **Theming**: The application uses a single, default theme based on the defined color palette. There is no separate light/dark mode.

## 5. Deployment

-   **Platform**: Netlify
-   **Build Command**: `npm run build`
-   **Publish Directory**: `dist/`
-   **Environment Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be configured in the Netlify dashboard.

## 6. Performance Optimizations (as per documentation)

-   Lazy loading of components.
-   Image size restrictions (e.g., 2MB for screenshots).
-   Efficient database queries.
-   Proper indexing on database tables.
-   Caching of static assets (handled by Netlify/browser).

## 7. Security Considerations (as per documentation)

-   Row Level Security (RLS) on all Supabase tables.
-   Role-Based Access Control (RBAC).
-   Secure file upload restrictions (size, type).
-   Public/private policies on Supabase Storage buckets.
-   Admin-only access to sensitive database operations via Edge Functions.

## 8. Client-Side Image Processing

-   **POI Icon Uploads**: In `PoiTypeManager.tsx`, when an admin uploads an image for a POI Type icon:
    -   The image is resized client-side to a maximum dimension of 48px (maintaining aspect ratio).
    -   The resized image is converted to PNG format before being uploaded to Supabase Storage.
    -   This reduces storage requirements and ensures a consistent format for icons.

### Database Schema (`supabase/migrations`)

Brief overview of key tables like `profiles`, `grid_squares`, `pois`, `poi_types` and their relationships. 
(This section would ideally be auto-generated or link to a schema visualizer if the project had one).

### SQL Helper Functions

-   **`schedule_cron_job(job_name TEXT, cron_expression TEXT, command TEXT)`**: 
    -   Located in Supabase SQL (`See schedule-admin-task/index.ts` for definition comment or SQL migration file).
    -   Purpose: Wraps `cron.schedule` to allow scheduling jobs via RPC from Supabase Functions. Includes basic exception handling.
    -   Called by: `schedule-admin-task` Supabase Function.
-   **`unschedule_cron_job(job_name TEXT)`**:
    -   Located in Supabase SQL (`See delete-scheduled-admin-task/index.ts` for definition comment or SQL migration file).
    -   Purpose: Wraps `cron.unschedule` for removing jobs via RPC.
    -   Called by: `delete-scheduled-admin-task` Supabase Function.
-   **`convert_to_utc_components(local_dt_str TEXT, tz TEXT)`**:
    -   Located in Supabase SQL.
    -   Purpose: Converts a local timestamp string (given in a specific IANA timezone `tz`) into its UTC hour, UTC minute, and UTC day of the week (0-6, Sunday=0). This is crucial for generating correct UTC-based CRON expressions for `pg_cron` when users schedule tasks in their local time.
    -   Input: `local_dt_str` (e.g., "YYYY-MM-DD HH:MM:SS"), `tz` (e.g., "Europe/Berlin").
    -   Output: Table with `utc_hour` (INT), `utc_minute` (INT), `utc_day_of_week` (INT).
    -   Called by: `schedule-admin-task` Supabase Function.

## Key Libraries and Frameworks

-   **React**: Used for frontend development.
-   **Supabase**: Provides backend services including authentication, database, and storage.
-   **Tailwind CSS**: Used for styling components.
-   **Vite**: Used as the build tool for the project.
-   **React Router v6**: Used for client-side routing.
-   **Supabase Edge Functions**: Used for server-side logic and secure operations.
-   **Supabase SQL**: Used for database operations and SQL helper functions.
-   **Supabase Functions**: Used for server-side logic and scheduled tasks.
-   **Supabase Storage**: Used for storing images and icons.
-   **Supabase Auth**: Used for user authentication.
-   **Supabase SQL**: Used for database operations and SQL helper functions.
-   **Supabase SQL**: Used for database operations and SQL helper functions.

## User Deletion and Foreign Key Constraints

When implementing user deletion, it's crucial to ensure that foreign key constraints are properly configured to allow cascading deletes or set null actions.

### `profiles` table and `auth.users`

The `public.profiles` table has an `id` column that is a foreign key to `auth.users(id)`. By default, this constraint (`profiles_id_fkey`) might be created with `ON DELETE NO ACTION`. This will prevent a user from being deleted from `auth.users` if a corresponding profile exists.

To fix this, the constraint must be updated to `ON DELETE CASCADE`:

```sql
-- 1. Drop the existing constraint
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_id_fkey;

-- 2. Add it back with ON DELETE CASCADE
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
REFERENCES auth.users (id) ON DELETE CASCADE;
```

### Tables referencing `public.profiles`

Similarly, other tables like `pois` (via `created_by`) and `grid_squares` (via `uploaded_by`) may reference `public.profiles(id)`. If these foreign key constraints also have `ON DELETE NO ACTION` or `ON DELETE RESTRICT`, they will block the deletion of a profile, which in turn would block the deletion of the auth user.

These constraints must also be updated to either `ON DELETE CASCADE` (if the related data should be deleted with the profile) or `ON DELETE SET NULL` (if the related data should be kept but disassociated from the deleted profile).

**Example to identify such constraints:**
```sql
SELECT
    conname AS constraint_name,
    conrelid::regclass AS referencing_table_name,
    a.attname AS referencing_column_name,
    CASE confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
        ELSE 'UNKNOWN'
    END AS on_delete_action
FROM
    pg_constraint AS c
JOIN
    pg_attribute AS a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE
    c.contype = 'f'  -- 'f' for foreign key
    AND confrelid = 'public.profiles'::regclass -- The table being referenced (profiles)
    AND conrelid::regclass::text LIKE 'public.%'; -- Only look in the public schema for referencing tables
```

**Example to update a constraint to `ON DELETE SET NULL`:**
```sql
-- Assuming 'fk_pois_created_by' is the constraint name on 'pois' table
ALTER TABLE public.pois
DROP CONSTRAINT fk_pois_created_by;

ALTER TABLE public.pois
ADD CONSTRAINT fk_pois_created_by FOREIGN KEY (created_by)
REFERENCES public.profiles (id) ON DELETE SET NULL;
```

**Example to update a constraint to `ON DELETE CASCADE`:**
```sql
-- Assuming 'fk_pois_created_by' is the constraint name on 'pois' table
ALTER TABLE public.pois
DROP CONSTRAINT fk_pois_created_by;

ALTER TABLE public.pois
ADD CONSTRAINT fk_pois_created_by FOREIGN KEY (created_by)
REFERENCES public.profiles (id) ON DELETE CASCADE;
``` 