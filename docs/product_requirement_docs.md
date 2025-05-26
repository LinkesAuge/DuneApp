# Product Requirement Document: Dune Awakening Deep Desert Tracker

## 1. Introduction

The Deep Desert Tracker is a web application designed to assist players of the game Dune Awakening in tracking and managing exploration data within the game's deep desert region. The application aims to provide a collaborative platform for users to share information about points of interest (POIs), grid-based map data, and other relevant exploration details.

## 2. Goals

- To provide a centralized platform for Dune Awakening players to track deep desert exploration.
- To facilitate collaboration and information sharing among users.
- To offer a user-friendly interface for managing map data and POIs.
- To ensure data integrity and security through role-based access control.

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

### 4.3. Points of Interest (POIs)
- Users can add POIs to any grid square.
- POI attributes:
    - Title
    - Category and Type
    - Description
    - Multiple screenshots (up to 5 per POI)
    - Creation metadata (creator, creation date).

#### 4.3.1. POI Types
- POIs are organized into categories:
    - Base (Guild bases, outposts)
    - Resources (Spice, crystals, ores)
    - Locations (Control points, caves, facilities)
    - NPCs (Vendors, trainers, representatives)
- Each POI type includes:
    - Name
    - Icon
    - Color
    - Category
    - Default description (optional)

### 4.4. Admin Panel
- User Management:
    - View all users.
    - Change user roles.
    - Monitor pending accounts.
- POI Type Management:
    - Create, edit, and delete POI types.
    - Customize icons and colors for POI types.
    - Organize POI categories.
- Database Management:
    - Create database backups.
    - Restore database from backup.
    - Reset map data.

## 5. Non-Functional Requirements

- **Performance**: Application should be responsive with lazy loading of components and optimized database queries.
- **Security**: Implement Row Level Security (RLS) on all database tables, role-based access control, and secure file uploads.
- **Usability**: Intuitive and user-friendly interface with a desert-themed design.
- **Scalability**: The system should be designed to handle a growing number of users and data.
- **Browser Support**: Support for modern browsers (Chrome, Firefox, Safari, Edge) and responsive design for mobile devices. 