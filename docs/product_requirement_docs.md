# Product Requirement Document: Dune Awakening Deep Desert Tracker

## 1. Introduction

The Deep Desert Tracker is a web application designed to assist players of the game Dune Awakening in tracking and managing exploration data within the game's deep desert region. The application aims to provide a collaborative platform for users to share information about points of interest (POIs), grid-based map data, and other relevant exploration details.

## 2. Goals

- To provide a centralized platform for Dune Awakening players to track deep desert exploration.
- To facilitate collaboration and information sharing among users.
- To offer a user-friendly interface for managing map data and POIs.
- To ensure data integrity and security through role-based access control.
- To provide consistent and intuitive filtering and navigation experiences across all interface components.

## 3. Target Audience

Players of the Dune Awakening game who are interested in exploring the deep desert region and collaborating with other players.

## 4. Features

### 4.1. Authentication System
- User signup with email and password.
- User sign-in.
- Automatic assignment of 'pending' role on signup.
- Role-based access to features.

#### 4.1.1. User Roles
    1.  **Admin**: Full access, user management, POI type management, database operations.
    2.  **Editor**: Can edit any grid square, manage POI types, edit/delete any POI.
    3.  **Member**: Can add screenshots to empty grid squares, update own screenshots, add/manage own POIs.
    4.  **Pending**: Limited access (view own profile) until approved by admin.

### 4.2. Grid Map System
- 9x9 grid map representing the deep desert.
- Coordinate system (A1-I9).
- Screenshot upload and management per grid square.
    - Max file size: 2MB.
    - Supported formats: JPEG, PNG, WebP.
    - Gallery view for multiple screenshots.
    - Upload date and user tracking.
- Exploration status tracking.
- Association of Points of Interest to grid squares.
- Navigation between adjacent squares.
- **Unified Filter System**: Consistent filtering interface with POI page, featuring category-based grouping and standardized button styling.

### 4.3. Points of Interest (POIs)
- Users can add POIs to any grid square.
- POI attributes:
    - Title
    - Category and Type
    - Description
    - Multiple screenshots (up to 5 per POI)
    - Creation metadata (creator, creation date).
- **Enhanced Filtering**: Category-based filters with consistent styling and grouping across POI page and grid map interfaces.
- **Real-time Updates**: POI icons update immediately on grid map when new POIs are added without requiring page refreshes.

#### 4.3.1. POI Types
- POIs are organized into categories:
    - Base (Guild bases, outposts)
    - Resources (Spice, crystals, ores)
    - Locations (Control points, caves, facilities)
    - NPCs (Vendors, trainers, representatives)
- Each POI type includes:
    - Name
    - Icon (emoji or custom image)
    - Color
    - Category
    - Default description (optional)
    - Transparent background option for custom icons

### 4.4. Comment System (Planned)
- **POI Comments**: Users can comment on individual POIs to share strategies, tips, and additional information.
- **Grid Square Comments**: Community discussions about specific grid squares and exploration findings.
- **Comment Threading**: Support for replies and discussions within comment threads.
- **Moderation Tools**: Admin controls for managing comment quality and community guidelines.
- **Real-time Updates**: Live comment feeds and notifications for active discussions.

### 4.5. Admin Panel
- User Management:
    - View all users.
    - Change user roles.
    - Monitor pending accounts.
    - Delete users with proper cascade handling.
- POI Type Management:
    - Create, edit, and delete POI types.
    - Customize icons and colors for POI types.
    - Organize POI categories.
    - Upload custom icons with transparent background support.
- Database Management:
    - Create database backups.
    - Restore database from backup.
    - Reset map data.
    - Scheduled task management with timezone-aware scheduling.

### 4.6. User Interface & Experience
- **Consistent Design Language**: Unified styling across all components using standardized button classes and color schemes.
- **Desert Theme**: Sand, night, and spice color palette throughout the application.
- **Responsive Design**: Mobile-first approach with responsive layouts for all device types.
- **Accessibility**: High contrast ratios and accessible component design.
- **Visual Consistency**: Aligned filter styling between POI page and grid map for intuitive navigation.

### 4.7. Performance & Real-time Features
- **Immediate UI Updates**: POI changes reflect instantly across all components without page refreshes.
- **Optimized Rendering**: React optimization patterns for smooth user experience.
- **Database Synchronization**: Robust callback chains ensuring data consistency across components.

## 5. Planned Feature Enhancements

### 5.1. High-Priority Features
- **Favorites/Bookmarking System**: Star POIs for quick access with dedicated favorites filter.
- **Recent Activity Feed**: Real-time display of recent POI additions, updates, and community activity.
- **Quick Filter Presets**: One-click access to common search combinations (e.g., "My POIs", "Recent Discoveries").
- **Export Functionality**: CSV export of filtered POI data for external analysis.
- **POI Templates**: Pre-filled forms for common POI types to speed up data entry.

### 5.2. Advanced Features
- **Route Planning**: Path optimization between multiple POIs for efficient exploration.
- **Map Overlays**: Visual indicators for resource density, exploration progress, and territory control.
- **POI Verification System**: Community voting and verification for POI accuracy.
- **Guild/Team Support**: Group management and collaborative exploration tools.
- **Personal Analytics**: Individual exploration statistics and achievement tracking.
- **Bulk Operations**: Multi-select functionality for POI management and batch operations.
- **Progressive Web App (PWA)**: Offline capabilities and mobile app-like experience.

## 6. Non-Functional Requirements

- **Performance**: Application should be responsive with lazy loading of components and optimized database queries.
- **Security**: Implement Row Level Security (RLS) on all database tables, role-based access control, and secure file uploads.
- **Usability**: Intuitive and user-friendly interface with a desert-themed design and consistent filtering experiences.
- **Scalability**: The system should be designed to handle a growing number of users and data.
- **Browser Support**: Support for modern browsers (Chrome, Firefox, Safari, Edge) and responsive design for mobile devices.
- **Real-time Responsiveness**: Immediate visual feedback for all user actions without requiring page refreshes.
- **Visual Consistency**: Unified design language and styling patterns across all application components. 