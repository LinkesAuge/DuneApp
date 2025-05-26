# Product Requirement Document: Dune Awakening Deep Desert Tracker

## 1. Introduction

The Deep Desert Tracker is a web application designed to assist players of the game Dune Awakening in tracking and managing exploration data within both the deep desert region and the Hagga Basin. The application provides a collaborative platform for users to share information about points of interest (POIs), grid-based map data, and interactive coordinate-based mapping across multiple game regions.

## 2. Goals

- To provide a centralized platform for Dune Awakening players to track exploration across multiple game regions.
- To facilitate collaboration and information sharing among users through interactive mapping systems.
- To offer a user-friendly interface for managing map data, POIs, and region-specific exploration tools.
- To ensure data integrity and security through role-based access control.
- To provide consistent and intuitive filtering and navigation experiences across all interface components.
- To support both grid-based exploration tracking and precise coordinate-based POI placement.

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

### 4.2. Deep Desert Map System (formerly Grid Map System)
- 9x9 grid map representing the deep desert region.
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

### 4.3. Hagga Basin Interactive Map System
- **Large-Scale Interactive Map**: 4000x4000 pixel interactive map with zoom and pan functionality.
- **Precise POI Placement**: Click-to-place POI system using pixel coordinates (0-4000 range).
- **Map Layers & Overlays**:
    - Admin-uploadable base map (PNG, JPEG, WebP formats).
    - Multiple overlay layers with individual opacity controls.
    - Layer ordering system with admin management.
    - User-toggleable overlay visibility.
- **Advanced POI Privacy System**:
    - **Global POIs**: Visible to all users (default behavior).
    - **Private POIs**: Visible only to the creator.
    - **Shared POIs**: Selective sharing with specific users.
    - **POI Collections**: Grouping system for organizing and sharing multiple POIs.
- **Custom Icon System**:
    - User-uploadable custom icons (1MB max, PNG format).
    - Maximum 10 custom icons per user.
    - Emoji icon picker integration.
    - Personal icon library management.
- **Touch & Desktop Support**: Full zoom/pan functionality with touch gesture support.
- **Unified POI Integration**: Seamless integration with existing POI types, categories, and functionality.

### 4.4. Points of Interest (POIs) - Unified System
- **Multi-Map Support**: POIs can be placed on either Deep Desert grid or Hagga Basin coordinate system.
- **Map Type Identification**: Clear tagging system distinguishing between "Deep Desert" and "Hagga Basin" POIs.
- POI attributes:
    - Title
    - Category and Type (shared across both map systems)
    - Description
    - Multiple screenshots (up to 5 per POI)
    - Creation metadata (creator, creation date)
    - **Privacy Level**: Global, Private, or Shared visibility options
    - **Collection Membership**: Association with user-created POI collections
- **Enhanced Filtering**: Category-based filters with map type separation and consistent styling.
- **Real-time Updates**: POI icons update immediately across all map interfaces without requiring page refreshes.
- **Cross-Map Integration**: Unified POI page displaying POIs from both map systems with clear identification.

### 4.5. Comment System (Planned)
- **POI Comments**: Users can comment on individual POIs to share strategies, tips, and additional information.
- **Grid Square Comments**: Community discussions about specific grid squares and exploration findings.
- **Comment Threading**: Support for replies and discussions within comment threads.
- **Moderation Tools**: Admin controls for managing comment quality and community guidelines.
- **Real-time Updates**: Live comment feeds and notifications for active discussions.

### 4.6. POI Collections & Sharing System
- **Collection Management**: 
    - Create named collections of POIs for organization.
    - Add/remove POIs from collections.
    - Public/private collection visibility settings.
    - Collection descriptions and metadata.
- **Advanced Sharing Options**:
    - **Per-POI Sharing**: Share individual POIs with specific users.
    - **Collection Sharing**: Share entire collections with selected users or make public.
    - **Permission Management**: Granular control over who can view shared content.
- **User Custom Icons**:
    - Personal icon library with upload capabilities.
    - 1MB file size limit, PNG format restriction.
    - Maximum 10 custom icons per user account.
    - Integration with POI creation for personalized markers.

### 4.7. Admin Panel - Extended Management
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
- **Hagga Basin Management**:
    - **Base Map Upload**: Admin interface for uploading and managing the primary Hagga Basin map.
    - **Overlay Management**: Upload, order, and configure map overlay layers.
    - **Layer Controls**: Set opacity, toggle availability, and display order for overlays.
    - **POI Oversight**: Administrative tools for managing Hagga Basin POIs.
- Database Management:
    - Create database backups.
    - Restore database from backup.
    - Reset map data (both Deep Desert and Hagga Basin).
    - Scheduled task management with timezone-aware scheduling.

### 4.8. User Interface & Experience
- **Consistent Design Language**: Unified styling across all components using standardized button classes and color schemes.
- **Desert Theme**: Sand, night, and spice color palette throughout the application.
- **Responsive Design**: Mobile-first approach with responsive layouts for all device types.
- **Accessibility**: High contrast ratios and accessible component design.
- **Visual Consistency**: Aligned filter styling between POI page and grid map for intuitive navigation.

### 4.9. Dashboard & Analytics - Multi-Map Support
- **Separate Statistics**: Distinct analytics for Deep Desert and Hagga Basin activities.
- **Cross-Map Insights**: Combined exploration statistics and user engagement metrics.
- **Collection Analytics**: Statistics on POI collection creation and sharing.
- **Privacy Metrics**: Insights into public vs. private POI usage patterns.

### 4.10. Performance & Real-time Features
- **Immediate UI Updates**: POI changes reflect instantly across all components without page refreshes.
- **Optimized Rendering**: React optimization patterns for smooth user experience.
- **Database Synchronization**: Robust callback chains ensuring data consistency across components.

## 5. Planned Feature Enhancements

### 5.1. High-Priority Features
- **Favorites/Bookmarking System**: Star POIs for quick access with dedicated favorites filter across both map systems.
- **Recent Activity Feed**: Real-time display of recent POI additions, updates, and community activity from both Deep Desert and Hagga Basin.
- **Quick Filter Presets**: One-click access to common search combinations (e.g., "My POIs", "Recent Discoveries", "Deep Desert Only").
- **Export Functionality**: CSV export of filtered POI data for external analysis, including map type identification.
- **POI Templates**: Pre-filled forms for common POI types to speed up data entry across both map systems.

### 5.2. Advanced Features
- **Route Planning**: Path optimization between multiple POIs within and across map systems.
- **Enhanced Map Overlays**: Dynamic overlays showing resource density, exploration progress, and territory control.
- **POI Verification System**: Community voting and verification for POI accuracy across both map systems.
- **Guild/Team Support**: Group management and collaborative exploration tools with collection sharing.
- **Personal Analytics**: Individual exploration statistics and achievement tracking across multiple map regions.
- **Bulk Operations**: Multi-select functionality for POI management and batch operations.
- **Progressive Web App (PWA)**: Offline capabilities and mobile app-like experience.
- **Advanced Coordinate Sharing**: Coordinate-based sharing system for precise location communication.

## 6. Non-Functional Requirements

- **Performance**: Application should be responsive with lazy loading of components, optimized database queries, and efficient handling of large interactive maps.
- **Security**: Implement Row Level Security (RLS) on all database tables, role-based access control, secure file uploads, and privacy-aware POI sharing.
- **Usability**: Intuitive and user-friendly interface with a desert-themed design, consistent filtering experiences, and seamless navigation between map systems.
- **Scalability**: The system should be designed to handle a growing number of users, large coordinate-based maps, and extensive POI datasets.
- **Browser Support**: Support for modern browsers (Chrome, Firefox, Safari, Edge) with responsive design for mobile devices and touch gesture support.
- **Real-time Responsiveness**: Immediate visual feedback for all user actions without requiring page refreshes across both map systems.
- **Visual Consistency**: Unified design language and styling patterns across all application components and map interfaces.
- **Cross-Platform Compatibility**: Consistent experience across desktop and mobile platforms with appropriate touch controls. 