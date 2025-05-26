# Production Setup Guide: Hagga Basin System

## Step 1: Apply Database Migration

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/projects
   - Select your project: `urgmimdahjhaecwepsov`

2. **Navigate to SQL Editor**
   - In the left sidebar, click **"SQL Editor"**
   - Click **"New query"**

3. **Apply the Migration**
   - Open the file `production_migration.sql` in your project
   - Copy the entire contents
   - Paste it into the SQL Editor
   - Click **"Run"** button

4. **Verify Success**
   - You should see: "Hagga Basin system migration completed successfully!"
   - Check that all tables were created by going to **Database** → **Tables**

## Step 2: Restart Your Development Server

Since we switched back to production Supabase, restart your dev server:

```bash
# Stop any running dev server
# Then start it again
npm run dev
```

## Step 3: Upload Your Hagga Basin Map

1. **Access Admin Panel**
   - Go to: http://localhost:5173
   - Log in with your admin account
   - Navigate to **Dashboard** → **Admin Panel**

2. **Upload Base Map**
   - Click on the **"Map Management"** tab
   - Upload your Hagga Basin map image
   - Click **"Set as Active Base Map"**

## Step 4: Test the Hagga Basin Page

1. **Navigate to Hagga Basin**
   - Click **"Hagga Basin"** in the main navigation
   - Your uploaded map should appear as the interactive base layer

2. **Test POI Placement**
   - Click **"Add POI"** button
   - Click on the map to place a POI
   - Fill out the POI details and save

## What the Migration Does

✅ **Fixes Profile Issues**: Adds missing `email` column to `profiles` table
✅ **Creates Hagga Basin System**: All tables for interactive mapping
✅ **Multi-Map Support**: Extends POI system for both Deep Desert and Hagga Basin
✅ **Privacy Controls**: Adds global/private/shared POI visibility
✅ **Collections**: POI organization and sharing features
✅ **Custom Icons**: User-uploaded icon support (max 10 per user)
✅ **RLS Policies**: Proper security for all features
✅ **Performance Indexes**: Optimized database queries

## Tables Created

- `hagga_basin_base_maps` - Admin-managed base maps
- `hagga_basin_overlays` - Optional overlay layers
- `poi_collections` - User POI collections
- `poi_collection_items` - Collection membership
- `poi_shares` - Individual POI sharing
- `custom_icons` - User-uploaded icons

## Schema Updates

- Extended `pois` table with:
  - `map_type` ('deep_desert' or 'hagga_basin')
  - `coordinates_x`, `coordinates_y` (pixel coordinates 0-4000)
  - `privacy_level` ('global', 'private', 'shared')

## Admin Features

- Upload and manage base maps
- Control overlay visibility and opacity
- Full access to all POI data regardless of privacy settings

## User Features

- Create private or shared POIs on Hagga Basin
- Organize POIs into collections
- Share individual POIs with specific users
- Upload up to 10 custom icons (1MB PNG max)

## Troubleshooting

If you encounter any issues:

1. **Check Migration Success**: Look for the success message in SQL Editor
2. **Verify Tables**: Ensure all tables were created in Database → Tables
3. **Check RLS Policies**: Verify policies exist in Database → Tables → [table] → Policies
4. **Admin Role**: Ensure your user has `role = 'admin'` in the `profiles` table

## Next Steps

After successful setup:
- Upload your Hagga Basin map
- Test POI creation and privacy controls
- Set up any desired overlay layers
- Invite users to test the new system! 