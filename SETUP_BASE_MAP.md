# Setting up Hagga Basin Base Map

## Step 1: Save the Map Image
1. Right-click on the map image you provided in the chat
2. Save it as `hagga_basin_map.png` in the root directory of this project (same folder as package.json)

## Step 2: Upload to Supabase Storage
Run the upload script:
```bash
node upload-base-map.js
```

This will:
- Upload the image to Supabase Storage under the 'screenshots' bucket
- Create the path 'hagga-basin-base-map.png'
- Display the public URL

## Step 3: Apply Database Migration
Run the migration to create the base map record:
```bash
npx supabase db reset
```

This will:
- Create the base map record in the `hagga_basin_base_maps` table
- Set it as the active base map
- Make it available in the Hagga Basin page

## Step 4: Verify Setup
1. Open the application at http://localhost:5173
2. Navigate to "Hagga Basin" in the navbar
3. You should see your map loaded as the base layer
4. You can now click on the map to place POIs

## Troubleshooting
- If the image doesn't load, check the console for errors
- Verify the image file is exactly named `hagga_basin_map.png`
- Make sure Supabase is running with `npx supabase start` 