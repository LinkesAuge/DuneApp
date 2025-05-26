# Upload Hagga Basin Base Map - Easy Method

## Simple Steps

1. **Go to Admin Panel**
   - Open your application: http://localhost:5173
   - Log in as an admin user
   - Go to **Dashboard** → **Admin Panel**

2. **Navigate to Map Management**
   - Click on the **"Map Management"** tab in the Admin Panel
   - You'll see a "Upload Hagga Basin Base Map" section

3. **Upload Your Map**
   - Click in the upload area
   - Select the Hagga Basin map image you provided
   - The system will show a preview
   - Click **"Set as Active Base Map"**

4. **Verify the Map**
   - Once uploaded successfully, go to **"Hagga Basin"** in the main navigation
   - Your map should now be displayed as the interactive base layer
   - You can now click on the map to place POIs!

## What This Does

- ✅ Uploads your map image to Supabase Storage
- ✅ Creates a database record marking it as the active base map
- ✅ Makes it immediately available in the Hagga Basin page
- ✅ Enables POI placement on the 4000x4000 coordinate system

## Troubleshooting

- **File too large?** The limit is 50MB - most map images should be fine
- **Upload fails?** Check that Supabase is running (`npx supabase start`)
- **Map doesn't show?** Try refreshing the Hagga Basin page after upload

That's it! Much easier than the command-line method. 🎉 