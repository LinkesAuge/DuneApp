# Dune Awakening Deep Desert Tracker Documentation

## Overview

The Deep Desert Tracker is a web application for tracking and managing exploration data in Dune Awakening's deep desert region. It features a grid-based map system, point of interest tracking, and collaborative exploration features.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Build Tool**: Vite

## Features

### Authentication System

The application uses Supabase Auth with email/password authentication. Users can:
- Sign up with email and password
- Sign in to existing accounts
- Automatically get assigned a 'pending' role on signup
- Access different features based on their role

#### User Roles

1. **Admin**
   - Full access to all features
   - Can manage users and their roles
   - Can manage POI types
   - Can perform database operations

2. **Editor**
   - Can edit any grid square
   - Can manage POI types
   - Can edit/delete any POI

3. **Member**
   - Can add screenshots to empty grid squares
   - Can update their own screenshots
   - Can add and manage their own POIs

4. **Pending**
   - Limited access until approved by admin
   - Can only view their own profile

### Grid Map System

The application features a 9x9 grid map system where each square represents a region in the deep desert.

#### Grid Square Features
- Coordinate system (A1-I9)
- Screenshot upload/management
- Exploration status tracking
- Points of Interest association
- Navigation between adjacent squares

#### Screenshot Management
- Max file size: 2MB
- Supported formats: JPEG, PNG, WebP
- Gallery view for multiple screenshots
- Upload date and user tracking

### Points of Interest (POIs)

POIs can be added to any grid square and include:
- Title
- Category and type
- Description
- Multiple screenshots (up to 5)
- Creation metadata

#### POI Types
Organized into categories:
- Base (Guild bases, outposts)
- Resources (Spice, crystals, ores)
- Locations (Control points, caves, facilities)
- NPCs (Vendors, trainers, representatives)

Each POI type includes:
- Name
- Icon
- Color
- Category
- Default description

### Admin Panel

The admin panel provides tools for:

#### User Management
- View all users
- Change user roles
- Monitor pending accounts

#### POI Type Management
- Create/edit/delete POI types
- Customize icons and colors
- Organize categories

#### Database Management
- Create backups
- Restore from backup
- Reset map data

### Storage System

The application uses two Supabase storage buckets:

1. **screenshots**
   - Stores grid square screenshots
   - Public read access
   - Authenticated upload access
   - User-specific delete access

2. **poi-icons**
   - Stores POI type icons
   - Public read access
   - Admin/editor upload access
   - Admin/editor delete access

## Code Structure

### Directory Organization

```
/src
  /components
    /admin        # Admin panel components
    /auth         # Authentication components
    /common       # Shared components
    /grid         # Grid map components
    /poi          # POI management components
  /lib           # Utility functions and configurations
  /pages         # Page components
  /types         # TypeScript type definitions
```

### Key Components

#### Grid System
- `GridContainer`: Main grid map component
- `GridSquare`: Individual grid square component
- `GridSquareModal`: Detail view for grid squares
- `GridGallery`: Screenshot gallery component

#### POI System
- `PoiList`: POI listing component
- `PoiCard`: Individual POI display
- `PoiEditForm`: POI editing interface
- `AddPoiForm`: POI creation interface

#### Admin Components
- `AdminPanel`: Main admin interface
- `PoiTypeManager`: POI type management
- `UserManagement`: User role management

### Database Schema

#### Tables
1. `profiles`
   - User profiles and roles
   - Linked to Supabase Auth

2. `grid_squares`
   - Grid map data
   - Screenshot metadata

3. `poi_types`
   - POI categories and types
   - Visual customization data

4. `pois`
   - Point of Interest data
   - Links to grid squares and types

## Styling

### Color Palette

The application uses a desert-inspired color scheme:

- **Sand**: Earth tones for backgrounds and containers
- **Spice**: Orange/red accents for primary actions
- **Sky**: Blue tones for interactive elements
- **Night**: Dark tones for text and borders

### Typography

- **Display Font**: Orbitron (headers, titles)
- **Body Font**: Inter (general text)

## Deployment

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase project

### Environment Variables
Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Deployment Process
1. Build the application: `npm run build`
2. Deploy to Netlify:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables must be set in Netlify dashboard

### Database Migrations
Located in `/supabase/migrations/`
- Run automatically during Supabase deployments
- Maintain database schema and policies
- Include initial data seeding

## Edge Functions

Located in `/supabase/functions/`

### manage-database
Handles database operations:
- Backup creation
- Backup restoration
- Map data reset

### get-user-emails
Admin-only function for retrieving user email addresses

## Security Considerations

- Row Level Security (RLS) policies on all tables
- Role-based access control
- Secure file upload restrictions
- Public/private storage bucket policies
- Admin-only database operations

## Performance Optimizations

- Lazy loading of components
- Image size restrictions
- Efficient database queries
- Proper indexing on database tables
- Caching of static assets

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile devices
- Progressive enhancement approach