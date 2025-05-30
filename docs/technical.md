# Technical Documentation: Dune Awakening Deep Desert Tracker

## 🎉 Production Status: FULLY IMPLEMENTED & READY ✅

**Current Status**: This is a **production-ready application** with comprehensive functionality implemented and operational.

### **Latest Enhancement: UI/UX Polish & Screenshot Management - COMPLETED** ✅
**Date**: January 27, 2025

#### **✅ UI/UX Polish Implementation**
- **Compact Metadata Layout**: 6 core components updated with single-line layouts using `flex justify-between`
- **Grammar Correction System**: New `formatDateWithPreposition()` utility in `dateUtils.ts` for proper date/time grammar
- **Exploration System Cleanup**: Removed visual checkmarks while preserving all backend tracking functionality
- **Visual Consistency**: Professional appearance with improved information density across all components

#### **✅ Enhanced Screenshot Management System**
- **Comprehensive Delete Functionality**: Added delete capabilities with proper file cleanup and database field reset
- **Exploration Status Synchronization**: All screenshot operations properly update exploration tracking
- **Database Operation Safety**: Converted to UPSERT operations with conflict resolution to prevent duplicate key violations
- **Real-time Progress Updates**: Enhanced global event broadcasting system for immediate dashboard updates

#### **✅ Database Integrity Enhancements**
- **Constraint Violation Resolution**: Fixed "grid_squares_coordinate_key" duplicate violations
- **UPSERT Operations**: All grid square operations use `onConflict: 'coordinate'` resolution
- **State Synchronization**: Local and database state remain synchronized across all operations
- **File Storage Cleanup**: Comprehensive cleanup of both current and original screenshot files

### **Latest Enhancement: Enhanced Database Management System - COMPLETED** ✅
**Date**: January 28, 2025

#### **✅ Separate Map Reset Functionality**
- **Independent Reset Operations**: DatabaseManagement component now provides separate reset buttons for Deep Desert and Hagga Basin maps
- **Map-Specific Warnings**: Each reset type shows detailed descriptions of exactly what will be deleted for that specific map
- **Enhanced Safety**: Requires specific confirmation text ("DELETE DEEP DESERT" vs "DELETE HAGGA BASIN") for each operation
- **Independent Backup Options**: Each map type can have its own backup created before reset

#### **✅ Custom Icons Preservation Enhancement**
- **Global Resource Protection**: Confirmed that custom POI types and icons are NOT deleted during map resets
- **Resource Categorization**: Custom icons stored in `screenshots/icons/` and `custom_icons` table remain untouched
- **User Asset Safety**: User-created POI types and custom icons are preserved across all reset operations
- **Backend Verification**: Verified `perform-map-reset` Edge Function only deletes map-specific data

#### **✅ Database Management UI Improvements**
- **Separate State Management**: Individual loading states and backup options for each map type (`isResettingDeepDesert`, `isResettingHaggaBasin`)
- **Enhanced User Experience**: Clear visual separation between Deep Desert and Hagga Basin reset sections
- **Detailed Warnings**: Comprehensive descriptions of what gets deleted during each reset operation
- **Type Safety**: Updated `DangerAction` type to support separate reset actions

### **Implementation Achievements** ✅
- **Frontend**: Complete React + TypeScript application with professional UI/UX polish
- **Backend**: Comprehensive Supabase integration with all services operational  
- **Database**: Advanced schema with privacy controls, collections, sharing systems, and UPSERT safety
- **Authentication**: Role-based access control with admin/user permissions
- **Dual Mapping Systems**: Both Deep Desert grid and Hagga Basin coordinate systems fully functional
- **Admin Tools**: Complete management panel with scheduling and automation
- **Map Settings Management**: Complete admin configuration system with database persistence
- **POI Position Editing**: Interactive map-based position change functionality
- **Custom Icon System**: User uploads with admin-configurable scaling (64px-128px)
- **Mobile Support**: Touch-optimized responsive design throughout
- **Real-time Updates**: Live synchronization across all interfaces with enhanced event broadcasting
- **Performance**: Optimized queries, React memoization, efficient rendering

### **Technical Excellence Demonstrated** 🏆
- **Code Quality**: 100% TypeScript coverage with comprehensive type definitions
- **Architecture**: Clean component separation with scalable patterns
- **Security**: Row Level Security throughout with proper access controls
- **Database Design**: Normalized schema with advanced relationship management and conflict resolution
- **UI Consistency**: Unified design system with desert theming and compact layouts
- **Error Handling**: Graceful error states and user feedback throughout
- **Testing Ready**: Well-structured code base ready for test implementation

**Deployment Status**: Ready for immediate production deployment to Netlify.

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
-   **UPSERT Operations for Data Integrity**: All grid square operations use UPSERT with conflict resolution to prevent duplicate key constraint violations during re-upload scenarios.
-   **Global Event Broadcasting for Real-time Updates**: Custom browser events ensure immediate dashboard updates across all screenshot operations (upload, crop, edit, delete).

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
-   **Layout Patterns**:
    -   **Compact Metadata**: Single-line layouts using `flex justify-between` for optimal horizontal space utilization
    -   **Consistent Sizing**: `text-xs` sizing and `gap-1` spacing throughout metadata displays
    -   **Professional Polish**: Clean, modern interface with attention to detail and improved information density

## 5. Deployment

-   **Platform**: Netlify
-   **Build Command**: `npm run build`
-   **Publish Directory**: `dist/`
-   **Environment Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be configured in the Netlify dashboard.

## 6. Performance Optimizations

-   Lazy loading of components.
-   Image size restrictions (e.g., 2MB for screenshots).
-   Efficient database queries with UPSERT operations.
-   Proper indexing on database tables.
-   Caching of static assets (handled by Netlify/browser).
-   **Event-driven architecture**: Efficient event cleanup and minimal re-renders for real-time updates.
-   **Optimized rendering**: React memoization and component-level optimizations.

## 7. Security Considerations

-   Row Level Security (RLS) on all Supabase tables.
-   Role-Based Access Control (RBAC).
-   Secure file upload restrictions (size, type).
-   Public/private policies on Supabase Storage buckets.
-   Admin-only access to sensitive database operations via Edge Functions.
-   **Database operation safety**: UPSERT operations with conflict resolution prevent constraint violations.
-   **File cleanup security**: Proper cleanup of both current and original files during deletion operations.

## 8. Client-Side Image Processing

-   **POI Icon Uploads**: In `PoiTypeManager.tsx`, when an admin uploads an image for a POI Type icon:
    -   The image is resized client-side to a maximum dimension of 48px (maintaining aspect ratio).
    -   The resized image is converted to PNG format before being uploaded to Supabase Storage.
    -   This reduces storage requirements and ensures a consistent format for icons.

## 9. Enhanced Screenshot Management System

### 9.1. Screenshot Upload & Crop Operations
-   **UPSERT Operations**: All screenshot upload operations use `supabase.from('grid_squares').upsert()` with `onConflict: 'coordinate'` to handle both new and existing grid squares safely.
-   **Exploration Tracking**: Automatic `is_explored: true` setting during all upload and crop operations.
-   **File Management**: Comprehensive handling of both original and cropped screenshot files with proper cleanup.

### 9.2. Screenshot Deletion Workflow
1. **File Storage Cleanup**: Removes both current screenshot and original files from Supabase Storage
2. **Database Field Reset**: Sets all screenshot-related fields to null (`screenshot_url`, `original_screenshot_url`, crop data)
3. **Exploration Status Update**: Marks grid as `is_explored: false` to remove from exploration progress
4. **Global Event Broadcasting**: Notifies dashboard components of exploration change via custom browser events
5. **UI State Synchronization**: Grid squares return to proper empty state styling with sand-200 background

### 9.3. Real-time Progress System
-   **Event Sources**: Tracks 'crop', 'upload', 'recrop', 'delete' operations through global event system
-   **Component Listeners**: Dashboard components (ExplorationProgress, StatisticsCards, RegionalStatsPanel) automatically refresh on changes
-   **Performance Optimized**: Efficient event cleanup with minimal component re-renders
-   **Debug Support**: Console logging for troubleshooting exploration updates

## 10. Grammar Correction System

### 10.1. Date/Time Grammar Utility
-   **Function**: `formatDateWithPreposition()` in `src/lib/dateUtils.ts`
-   **Purpose**: Smart grammar detection for relative time vs actual dates
-   **Implementation**: 
    - Detects relative time patterns (e.g., "3 minutes ago", "2 hours ago")
    - Applies proper preposition usage: "Created by X 3 minutes ago" (not "on 3 minutes ago")
    - Maintains "on" for actual dates like "on January 27, 2025"
-   **Components Using**: HaggaBasinPoiCard, PoiCard, CommentItem

### 10.2. Professional Text Standards
-   All user-facing date/time text now uses grammatically correct English
-   Consistent application across all metadata display components
-   Enhanced perceived professionalism of the application

### Database Schema (`supabase/migrations`)

Brief overview of key tables like `profiles`, `grid_squares`, `pois`, `poi_types` and their relationships, now enhanced with UPSERT conflict resolution and proper foreign key handling.

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

-   **React**: Used for frontend development with enhanced component architecture.
-   **Supabase**: Provides backend services including authentication, database, and storage.
-   **Tailwind CSS**: Used for styling components with compact layout patterns.
-   **Vite**: Used as the build tool for the project.
-   **React Router v6**: Used for client-side routing.
-   **Supabase Edge Functions**: Used for server-side logic and secure operations.
-   **Supabase Storage**: Used for storing images and icons with comprehensive cleanup.
-   **Supabase Auth**: Used for user authentication.

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

## Database Operation Safety and Constraint Management

### Grid Square UPSERT Operations

All grid square database operations now use UPSERT with conflict resolution to prevent duplicate key constraint violations:

```sql
-- Example UPSERT operation for grid squares
INSERT INTO grid_squares (coordinate, screenshot_url, uploaded_by, is_explored)
VALUES ($1, $2, $3, true)
ON CONFLICT (coordinate) 
DO UPDATE SET 
  screenshot_url = EXCLUDED.screenshot_url,
  uploaded_by = EXCLUDED.uploaded_by,
  updated_by = EXCLUDED.uploaded_by,
  is_explored = EXCLUDED.is_explored;
```

This pattern ensures that:
- New grid squares are created properly
- Existing grid squares are updated without constraint violations
- Users can delete and re-upload screenshots without errors
- Database integrity is maintained across all operations

### Exploration Status Management

The `is_explored` field is now managed consistently across all operations:
- **Upload/Crop Operations**: Set `is_explored: true`
- **Delete Operations**: Set `is_explored: false`
- **Dashboard Integration**: Real-time updates via global event broadcasting 

## Enhanced Backup System with Storage Files

The backup system has been enhanced to include not only database records but also all storage files (screenshots, POI images, comment images, custom icons).

### Backup Format

**New Enhanced Format (v2):**
```json
{
  "timestamp": "2025-01-28T...",
  "mapType": "deep_desert|hagga_basin|both",
  "database": {
    "grid_squares": [...],
    "pois": [...], 
    "comments": [...]
  },
  "files": {
    "grid_screenshots": [
      {
        "path": "grid_screenshots/A1_timestamp.jpg",
        "data": "base64encodeddata...",
        "contentType": "image/jpeg",
        "originalUrl": "https://..."
      }
    ],
    "poi_screenshots": [...],
    "comment_screenshots": [...],
    "custom_icons": [...]
  }
}
```

**Legacy Format (v1) - Still Supported:**
```json
{
  "timestamp": "2025-01-28T...",
  "grid_squares": [...],
  "pois": [...]
}
```

### Backup Process (`perform-map-backup`)

1. **Database Collection**: Fetches all database records based on map type
2. **File URL Collection**: Extracts all storage file URLs from database records
3. **File Download**: Downloads each file from Supabase Storage and converts to base64
4. **Backup Creation**: Creates comprehensive backup JSON with both database and file data
5. **Storage**: Uploads backup to appropriate folder based on map type

### Restore Process (`manage-database`)

1. **Format Detection**: Automatically detects old vs new backup format
2. **File Restoration**: Re-uploads all storage files to their original paths
3. **URL Mapping**: Creates mapping from old URLs to new URLs
4. **Database Restoration**: Updates database records with new file URLs
5. **Data Insertion**: Inserts updated records into database tables

### Storage Organization

- **Grid Screenshots**: `grid_screenshots/`, `grid_originals/`  
- **POI Screenshots**: `poi_screenshots/`, `poi_originals/`
- **Comment Screenshots**: `comment_screenshots/`
- **Custom Icons**: `icons/`

### Map Type Support

- **Deep Desert**: Only includes A1-I9 grid coordinates and related POIs/comments
- **Hagga Basin**: Only includes Hagga Basin POIs and comments  
- **Both**: Includes all map data and files

### Backup Storage Folders

- **Deep Desert**: `map-backups/deep-desert/`
- **Hagga Basin**: `map-backups/hagga-basin/`  
- **Combined**: `map-backups/combined/` (for "both" map type)

### File Processing

- Files are converted to base64 for storage in JSON backup
- During restore, base64 data is converted back to blobs and uploaded
- Original file paths and content types are preserved
- URL mapping ensures database references point to restored files

### Performance Considerations

- File downloads/uploads are processed in batches of 10 to avoid overwhelming the system
- Large backups may take several minutes to complete due to file processing
- Base64 encoding increases backup file size by ~33%

### Error Handling

- Missing files during backup are logged as warnings but don't stop the process
- Failed file uploads during restore are logged but don't block database restoration
- Backward compatibility ensures old backups can still be restored 

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Backend API Functions](#backend-api-functions)
4. [Enhanced Backup System (2025)](#enhanced-backup-system-2025)
5. [Frontend Architecture](#frontend-architecture)
6. [Authentication & Security](#authentication--security)
7. [File Storage Management](#file-storage-management)
8. [Real-time Features](#real-time-features)
9. [UI/UX System (2025 Updates)](#uiux-system-2025-updates)
10. [Performance & Optimization](#performance--optimization)
11. [Deployment & Infrastructure](#deployment--infrastructure)

---

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Dune-inspired design system
- **Backend**: Supabase (PostgreSQL + Real-time + Edge Functions)
- **Authentication**: Supabase Auth with email/password
- **Storage**: Supabase Storage for images and backups
- **Image Processing**: Canvas API for cropping, react-zoom-pan-pinch for map interaction
- **Routing**: React Router v6
- **State Management**: React Context + Local State

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │────│  Supabase API    │────│   PostgreSQL    │
│   (Vite + TS)   │    │  (Edge Functions) │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         └──────────────│ Supabase Storage │─────────────┘
                        │ (Images/Backups) │
                        └──────────────────┘
```

---

## Database Schema

### Core Tables

#### `profiles`
- **Purpose**: User profile information linked to Supabase Auth
- **Key Fields**:
  - `id` (UUID, Primary Key, references auth.users)
  - `username` (TEXT, unique)
  - `email` (TEXT)
  - `role` (user_role ENUM: 'member', 'editor', 'admin')
  - `avatar_url` (TEXT, optional)
  - `created_at` (TIMESTAMP)

#### `grid_squares`
- **Purpose**: Deep Desert grid square data (A1-I9, 81 total squares)
- **Key Fields**:
  - `id` (UUID, Primary Key)
  - `coordinate` (TEXT, unique, e.g., "A1", "B2")
  - `screenshot_url` (TEXT, optional)
  - `original_screenshot_url` (TEXT, for uncropped versions)
  - `crop_x`, `crop_y`, `crop_width`, `crop_height` (INTEGER, crop data)
  - `is_explored` (BOOLEAN, default false)
  - `uploader_id` (UUID, references profiles.id)
  - `created_at` (TIMESTAMP)

#### `pois` (Points of Interest)
- **Purpose**: POI data for both Deep Desert and Hagga Basin
- **Key Fields**:
  - `id` (UUID, Primary Key)
  - `title` (TEXT, required)
  - `description` (TEXT, optional)
  - `x_coordinate`, `y_coordinate` (NUMERIC, map coordinates)
  - `poi_type_id` (UUID, references poi_types.id)
  - `map_type` (map_type_enum: 'deep_desert', 'hagga_basin')
  - `grid_coordinate` (TEXT, for deep_desert POIs)
  - `screenshot_url` (TEXT, optional)
  - `is_public` (BOOLEAN, visibility setting)
  - `creator_id` (UUID, references profiles.id)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP) **[Added January 2025]**

#### `poi_types`
- **Purpose**: Categorized POI types (resources, landmarks, dangers, etc.)
- **Key Fields**:
  - `id` (UUID, Primary Key)
  - `name` (TEXT, unique)
  - `category` (TEXT, grouping mechanism)
  - `icon_url` (TEXT, optional custom icon)
  - `color` (TEXT, hex color code)
  - `description` (TEXT, optional)
  - `is_active` (BOOLEAN, admin control)
  - `created_at` (TIMESTAMP)

#### `comments`
- **Purpose**: Comments on POIs with optional screenshots
- **Key Fields**:
  - `id` (UUID, Primary Key)
  - `poi_id` (UUID, references pois.id)
  - `content` (TEXT, required)
  - `screenshot_url` (TEXT, optional)
  - `author_id` (UUID, references profiles.id)
  - `created_at` (TIMESTAMP)

#### `app_settings` **[Enhanced January 2025]**
- **Purpose**: Application configuration settings
- **Key Fields**:
  - `setting_key` (TEXT, Primary Key)
  - `setting_value` (JSONB, flexible configuration)
  - `updated_at` (TIMESTAMP)

### Database Triggers & Functions

#### Automatic Timestamp Updates **[Added January 2025]**
```sql
-- Trigger for automatic updated_at timestamps on POIs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pois_updated_at 
    BEFORE UPDATE ON pois 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Backend API Functions

### Supabase Edge Functions

#### Core Functions
1. **`perform-map-backup`** **[Enhanced January 2025]**
   - **Purpose**: Creates comprehensive backups with database + storage files
   - **Features**: 
     - Downloads all storage files and converts to base64
     - Creates v2 backup format with complete data
     - Supports Deep Desert, Hagga Basin, and combined backups
     - Batch file processing for performance

2. **`manage-database`** **[Enhanced January 2025]**
   - **Purpose**: Handles backup restoration with full file recovery
   - **Features**:
     - Detects v1 (legacy) vs v2 (enhanced) backup formats
     - Re-uploads all storage files during restore
     - Updates database URLs to point to restored files
     - Handles both legacy and enhanced backup formats

3. **`list-map-backups`** **[Enhanced January 2025]**
   - **Purpose**: Lists stored backups with detailed metadata analysis
   - **Features**:
     - Extracts backup content analysis (record counts, file counts)
     - Identifies backup format versions
     - Organizes by map type (Deep Desert, Hagga Basin, Combined)
     - Performance optimized with async processing

4. **`perform-map-reset`**
   - **Purpose**: Complete map data reset with optional backup
   - **Safety**: Comprehensive confirmation system with manual text input

5. **`delete-map-backup`**
   - **Purpose**: Secure backup file deletion
   - **Validation**: Admin-only access with proper error handling

#### Administrative Functions
- **`schedule-admin-task`**: Automated backup/reset scheduling
- **`get-scheduled-admin-tasks`**: Retrieve scheduled operations
- **`delete-scheduled-admin-task`**: Remove scheduled operations
- **`delete-user`**: Complete user account deletion
- **`update-user`**: Admin user profile updates

---

## Enhanced Backup System (2025)

### Backup Format Evolution

#### Version 1 (Legacy Format)
```json
{
  "timestamp": "2025-01-28T10:30:00Z",
  "mapType": "deep_desert",
  "grid_squares": [...],
  "pois": [...],
  "comments": [...]
}
```

#### Version 2 (Enhanced Format) **[New 2025]**
```json
{
  "timestamp": "2025-01-28T10:30:00Z",
  "mapType": "deep_desert",
  "formatVersion": "v2",
  "database": {
    "grid_squares": [...],
    "pois": [...],
    "comments": [...]
  },
  "files": {
    "grid_screenshots": [
      {
        "path": "grid_screenshots/A1_screenshot.jpg",
        "data": "base64EncodedImageData...",
        "contentType": "image/jpeg",
        "originalUrl": "https://..."
      }
    ],
    "poi_screenshots": [...],
    "comment_screenshots": [...],
    "custom_icons": [...]
  }
}
```

### Backup Process Architecture

#### Enhanced Backup Flow
1. **Database Collection**: Fetch all records based on map type filter
2. **URL Extraction**: Parse storage file URLs from database records
3. **File Download**: Download and convert files to base64 (batched processing)
4. **JSON Assembly**: Create comprehensive backup with both data and files
5. **Storage Upload**: Save to appropriate backup folder with metadata
6. **Cleanup**: Maintain maximum 10 backups per category

#### Enhanced Restore Flow
1. **Format Detection**: Automatically identify v1 vs v2 backup format
2. **File Re-upload**: Upload all storage files to original directory structure
3. **URL Mapping**: Create mapping between old and new file URLs
4. **Database Update**: Update all records with new file references
5. **Data Insertion**: Insert all records with updated file paths

### Storage Organization **[Enhanced 2025]**
```
screenshots/
├── map-backups/
│   ├── deep-desert/          # Deep Desert specific backups
│   ├── hagga-basin/          # Hagga Basin specific backups
│   └── combined/             # Combined (both maps) backups
├── grid_screenshots/         # A1-I9 grid square images
├── grid_originals/           # Uncropped grid square images
├── poi_screenshots/          # POI images (both map types)
├── poi_originals/            # Uncropped POI images
├── comment_screenshots/      # Comment images
└── icons/                    # Custom POI type icons
```

---

## Frontend Architecture

### Component Structure

#### Core Pages
- **`/`**: Landing page with Dune-inspired aesthetic
- **`/auth`**: Authentication (login/signup)
- **`/dashboard`**: Statistics and activity overview
- **`/grid`**: Deep Desert grid interface (A1-I9)
- **`/hagga-basin`**: Interactive Hagga Basin map
- **`/pois`**: POI management and browsing
- **`/admin`**: Administrative panel (admin users only)

#### Enhanced Component System **[2025 Updates]**

##### Core UI Components
1. **`DiamondIcon`** **[New 2025]**
   - Signature diamond-shaped icon container
   - Void/gold color scheme matching Dune aesthetic
   - Scalable sizing system (sm, md, lg, xl)

2. **`HexCard`** **[Enhanced 2025]**
   - Octagonal card component with integrated DiamondIcon
   - Gradient borders and sophisticated backgrounds
   - Used throughout landing page and feature showcases

3. **`POIPanel`** **[Unified 2025]**
   - Unified POI management component
   - Serves both Deep Desert and Hagga Basin
   - Grid/list view modes with advanced filtering
   - Real-time search and sorting capabilities

##### Enhanced Admin Components **[2025 Updates]**
- **Backup Management Interface**: Three-category backup organization
- **Content Analysis Display**: Shows database and file counts per backup
- **Danger Zone Interface**: Progressive warning system for destructive operations
- **Confirmation Modal System**: Manual text input for critical actions

### State Management Architecture

#### Context Providers
- **`AuthProvider`**: User authentication and profile data
- **`ThemeProvider`**: UI theme and settings management
- **Enhanced Settings Context**: Map settings and user preferences

#### Local State Patterns
```typescript
// Enhanced component state pattern
const ComponentName: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  
  // Real-time updates with event system
  useEffect(() => {
    const handleUpdate = () => {
      // Refresh data on real-time events
    };
    
    window.addEventListener('explorationUpdate', handleUpdate);
    return () => window.removeEventListener('explorationUpdate', handleUpdate);
  }, []);
};
```

---

## Authentication & Security

### Supabase Auth Integration
- **Email/Password Authentication**: Standard email-based authentication
- **Row Level Security (RLS)**: Database-level access control
- **Role-based Authorization**: Member, Editor, Admin roles
- **Session Management**: Automatic token refresh and validation

### Security Policies

#### Profile Access
```sql
-- Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

#### POI Access **[Enhanced with updated_at tracking]**
```sql
-- Public POIs viewable by all, private POIs only by creator
CREATE POLICY "POIs are viewable based on privacy" ON pois
    FOR SELECT USING (
        is_public = true OR 
        creator_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('editor', 'admin'))
    );

-- Only creators can update their POIs
CREATE POLICY "Users can update own POIs" ON pois
    FOR UPDATE USING (creator_id = auth.uid());
```

### Admin Security **[Enhanced 2025]**
- **Multi-layer Confirmation**: Text input confirmation for destructive operations
- **Audit Logging**: All admin actions logged with timestamps
- **Session Validation**: Admin functions require fresh session validation
- **Backup Integration**: Optional backup creation before destructive operations

---

## File Storage Management

### Supabase Storage Buckets

#### Screenshots Bucket **[Enhanced 2025]**
- **Public Access**: Read access for all authenticated users
- **Upload Policies**: Users can upload to their designated paths
- **File Types**: JPG, PNG, WebP images only
- **Size Limits**: 10MB per file maximum
- **Organization**: Structured folder hierarchy for different file types

#### Storage Policies **[Enhanced 2025]**
```sql
-- Enhanced storage policy for comprehensive backup system
CREATE POLICY "Allow authenticated read access" ON storage.objects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        bucket_id = 'screenshots' AND
        (storage.foldername(name))[1] IN ('grid_screenshots', 'poi_screenshots', 'comment_screenshots', 'icons')
    );

-- Admin backup access
CREATE POLICY "Allow admin backup operations" ON storage.objects
    FOR ALL USING (
        bucket_id = 'screenshots' AND
        (storage.foldername(name))[1] = 'map-backups' AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
```

### Image Processing **[Enhanced 2025]**

#### Crop System Enhancement
- **Real-time Exploration Tracking**: Automatic exploration status updates
- **Improved Delete Workflow**: Comprehensive file cleanup with status reset
- **Database Integrity**: Upsert operations prevent constraint violations
- **Event Broadcasting**: Real-time updates to dashboard components

---

## Real-time Features

### Event-Driven Updates **[Enhanced 2025]**

#### Custom Event System
```javascript
// Enhanced exploration update broadcasting
const broadcastExplorationUpdate = (source: string) => {
  const event = new CustomEvent('explorationUpdate', {
    detail: { source, timestamp: Date.now() }
  });
  window.dispatchEvent(event);
};

// Components listen for real-time updates
useEffect(() => {
  const handleExplorationUpdate = (event: CustomEvent) => {
    console.log(`Exploration update from: ${event.detail.source}`);
    refreshExplorationData();
  };

  window.addEventListener('explorationUpdate', handleExplorationUpdate);
  return () => window.removeEventListener('explorationUpdate', handleExplorationUpdate);
}, []);
```

#### Dashboard Real-time Integration
- **ExplorationProgress**: Auto-refreshes on grid operations
- **StatisticsCards**: Updates immediately on POI/comment changes
- **ActivityFeed**: Real-time activity updates
- **RegionalStatsPanel**: Instant regional statistics updates

### Performance Optimizations **[2025 Updates]**
- **Event Debouncing**: Prevents excessive re-renders
- **Efficient Component Updates**: Targeted updates for specific data changes
- **Memory Management**: Proper event listener cleanup
- **Batch Operations**: Multiple file operations processed efficiently

---

## UI/UX System (2025 Updates)

### Design System Evolution **[Major 2025 Overhaul]**

#### Color Palette Standardization
```css
/* Void/Space backgrounds for premium feel */
void-950: #2a2438   /* DiamondIcon backgrounds, focused elements */
slate-950/90        /* Primary dark backgrounds */
slate-900/80        /* Container backgrounds */
slate-800/60        /* Hover states, lighter backgrounds */

/* Dune Gold/Bronze accent system */
gold-300: #ffec7a   /* Primary accents, DiamondIcon borders */
amber-200           /* Prominent text on dark backgrounds */
yellow-300          /* Active states, highlights */

/* Application theme colors */
sand-50             /* Light page backgrounds */
sand-100            /* Hover states */
sand-200            /* Borders, input fields */
night-950           /* Dark mode primary */
spice-500           /* Primary action buttons */
```

#### Typography System **[Enhanced 2025]**
```css
/* Primary font stack for Dune aesthetic */
font-family: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"

/* Weight and tracking hierarchy */
.brand-title    { font-weight: 300; letter-spacing: 0.4em; }
.nav-label      { font-weight: 300; letter-spacing: 0.2em; }
.section-title  { font-weight: 400; letter-spacing: 0.1em; }
```

### Component Architecture **[2025 Standards]**

#### Styling Layer System
```typescript
// Standardized styling order for all components
const StyleLayers = {
  1: "Background gradients",     // Foundation layers
  2: "Interactive overlays",     // Hover/active states  
  3: "Content styling",          // Typography and icons
  4: "Accent elements"           // Underlines, shadows, borders
};
```

#### Animation Standards **[2025 Timing]**
- **Fast Interactions**: 300ms (hover states, simple changes)
- **Elegant Animations**: 700ms (expanding underlines, complex transitions)
- **Panel Transitions**: 500ms (sidebar animations, modals)
- **Loading States**: Contextual timing for user feedback

### Responsive Design Patterns **[Enhanced 2025]**
- **Mobile-First Strategy**: Design for mobile, enhance for desktop
- **Collapsible Panel System**: Three-panel layouts with toggleable sidebars
- **Touch Optimization**: Appropriate sizing for touch interactions
- **Breakpoint Consistency**: Standardized responsive behavior across components

---

## Performance & Optimization

### Frontend Optimization **[Enhanced 2025]**

#### Image Processing
- **Canvas-based Cropping**: Client-side image processing for instant feedback
- **Lazy Loading**: Images loaded on demand for better performance
- **File Size Optimization**: Automatic compression for uploaded images
- **Format Selection**: WebP support with fallbacks for compatibility

#### Component Performance
```typescript
// Optimized component patterns
const OptimizedComponent = React.memo(({ data, onUpdate }) => {
  // Memoized calculations
  const processedData = useMemo(() => {
    return expensiveDataProcessing(data);
  }, [data]);

  // Debounced event handlers
  const debouncedUpdate = useMemo(
    () => debounce(onUpdate, 300),
    [onUpdate]
  );

  return <div>{/* Component content */}</div>;
});
```

#### State Management Optimization
- **Context Optimization**: Separate contexts for different data domains
- **Local State Preference**: Use local state when possible to avoid unnecessary re-renders
- **Event System**: Custom events for cross-component communication
- **Memory Management**: Proper cleanup of event listeners and timers

### Backend Performance **[Enhanced 2025]**

#### Database Optimization
- **Indexing Strategy**: Optimized indexes on frequently queried columns
- **Query Optimization**: Efficient JOIN operations and data fetching
- **Connection Pooling**: Managed database connections for better performance
- **Batch Operations**: Process multiple operations together when possible

#### Storage Performance
- **CDN Integration**: Fast global content delivery through Supabase CDN
- **File Organization**: Structured folder hierarchy for efficient access
- **Backup Optimization**: Batch file processing to avoid system overload
- **Compression**: Efficient backup formats with base64 encoding

---

## Deployment & Infrastructure

### Environment Configuration

#### Production Environment
```bash
# Environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Development Setup
1. **Clone Repository**: `git clone [repository-url]`
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Configure `.env.local` file
4. **Database Setup**: Apply SQL migrations from `/sql` directory
5. **Storage Setup**: Create and configure Supabase storage buckets
6. **Development Server**: `npm run dev`

### Database Migrations **[Enhanced 2025]**

#### Recent Migration: POI Updated Timestamps
```sql
-- Add updated_at column to pois table
ALTER TABLE pois ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records
UPDATE pois SET updated_at = created_at WHERE updated_at IS NULL;

-- Create trigger for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pois_updated_at 
    BEFORE UPDATE ON pois 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Production Considerations **[2025 Updates]**

#### Performance Monitoring
- **Database Performance**: Monitor query performance and optimization opportunities
- **Storage Usage**: Track storage consumption and backup efficiency
- **User Analytics**: Monitor feature usage and performance bottlenecks
- **Error Tracking**: Comprehensive error logging and monitoring

#### Backup Strategy **[Enhanced 2025]**
- **Automated Backups**: Scheduled backup system for regular data protection
- **Multiple Backup Types**: Database-only vs complete (database + files) backups
- **Retention Policy**: Automatic cleanup of old backups (10 per category maximum)
- **Disaster Recovery**: Complete restoration capabilities from enhanced backup format

#### Security Considerations
- **API Rate Limiting**: Prevent abuse of API endpoints
- **File Upload Validation**: Comprehensive validation of uploaded content
- **Admin Action Auditing**: Log all administrative operations
- **Session Security**: Secure session management with appropriate timeouts

---

## Development Guidelines

### Code Quality Standards **[2025 Updates]**

#### TypeScript Standards
```typescript
// Enhanced interface definitions
interface BackupMetadata {
  database?: {
    grid_squares: number;
    pois: number;
    comments: number;
  };
  files?: {
    grid_screenshots: number;
    poi_screenshots: number;
    comment_screenshots: number;
    custom_icons: number;
  };
  formatVersion?: 'v1' | 'v2';
  mapType?: string;
  timestamp?: string;
}
```

#### Component Development
- **Consistent Props Interface**: Standardized prop patterns across components
- **Error Boundaries**: Proper error handling and user feedback
- **Accessibility**: WCAG compliance with proper ARIA labels
- **Testing**: Unit tests for critical functionality

#### Git Workflow
- **Feature Branches**: Separate branches for new features
- **Commit Messages**: Descriptive commit messages with component context
- **Code Reviews**: Peer review for all changes
- **Documentation Updates**: Update technical docs with significant changes

This technical documentation provides a comprehensive overview of the Dune Awakening Deep Desert Tracker system architecture, implementation details, and recent enhancements. The system represents a production-ready application with sophisticated backup capabilities, enhanced UI/UX design, and robust technical architecture. 