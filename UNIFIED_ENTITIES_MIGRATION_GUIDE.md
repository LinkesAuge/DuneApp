# Unified Entities Migration Guide

This guide will walk you through migrating from the separate items/schematics system to the new unified entities system with recipe support.

## 📋 Prerequisites

### Python Environment
```bash
# Install Python dependencies
pip install -r requirements.txt
```

### Environment Variables
Ensure your `.env` file contains:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# For icon uploads, you may need the service role key:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚀 Migration Process

### Step 1: Backup Current Data
**⚠️ Important: This migration will wipe all existing items/schematics data!**

Create a backup of your current database before proceeding.

### Step 2: Database Schema Migration

1. **Run the main migration:**
   ```sql
   -- In Supabase SQL Editor, run:
   \i unified_entities_migration.sql
   ```

2. **Set up storage policies:**
   ```sql
   -- In Supabase SQL Editor, run:
   \i storage_policies_for_entities.sql
   ```

### Step 3: Icon Upload

1. **Place your icons in the correct directory:**
   ```bash
   mkdir -p public/assets/entity-icons
   # Copy all your .webp, .png, .jpg files to this directory
   ```

2. **Upload icons to Supabase storage:**
   ```bash
   python upload_entity_icons.py
   ```

### Step 4: Import Full Dataset

1. **Replace sample files with full dataset:**
   - Replace `resources/ItemsDbReworkSample.xlsx` with full `ItemsDbRework.xlsx`
   - Replace other sample files with full versions as needed

2. **Generate and run full migration:**
   ```bash
   python excel_to_sql_converter.py
   # This will update unified_entities_migration.sql with full data
   ```

3. **Re-run the migration with full data:**
   ```sql
   -- In Supabase SQL Editor, truncate and reload:
   TRUNCATE entities, recipes, recipe_ingredients, recipe_outputs CASCADE;
   -- Then run the INSERT statements from the updated migration file
   ```

## 🔧 Frontend Updates

### Step 1: Update Type Definitions

The new types are in `src/types/unified-entities.ts`:
- `Entity` (replaces separate Item and Schematic)
- `Recipe`, `RecipeIngredient`, `RecipeOutput`
- `Tier`

### Step 2: Update Icon Utilities

The `src/utils/iconUtils.ts` now uses Supabase storage URLs instead of local assets.

### Step 3: Update Components (Required Changes)

1. **Items & Schematics Components:**
   - Update `src/components/items-schematics/` to use unified Entity interface
   - Replace separate item/schematic forms with unified form
   - Update filtering logic to use `is_schematic` field

2. **POI Linking System:**
   - Update to use new `poi_entity_links` table
   - Modify POI linking components to work with unified entities

3. **API Layer:**
   - Update `src/lib/api/` endpoints to work with entities instead of items/schematics
   - Add recipe-related API functions

## 🔍 Key Changes Summary

### Database Changes
- **Unified Table:** Single `entities` table with `is_schematic` boolean
- **Recipe System:** New tables for recipes, ingredients, and outputs
- **Simplified Hierarchy:** Text-based categories instead of FK relationships
- **POI Links:** Unified `poi_entity_links` table

### Data Structure Changes
- **item_id Field:** Secondary identifier from Excel data
- **Icon Storage:** Moved from local assets to Supabase storage
- **Tier System:** Preserved with new tier_number field
- **Recipes:** Full ingredient/output relationships

### Frontend Impact
- **Type Safety:** New TypeScript interfaces
- **Icon URLs:** Now point to Supabase storage
- **Filtering:** Updated to work with text-based categories
- **POI Integration:** Simplified linking system

## ✅ Verification Steps

### 1. Database Verification
```sql
-- Check entity count
SELECT COUNT(*) FROM entities;

-- Check recipe relationships
SELECT COUNT(*) FROM recipes;
SELECT COUNT(*) FROM recipe_ingredients;
SELECT COUNT(*) FROM recipe_outputs;

-- Verify categories/types
SELECT DISTINCT category FROM entities ORDER BY category;
SELECT DISTINCT type FROM entities ORDER BY type;
```

### 2. Storage Verification
- Check Supabase Storage > screenshots > entity-icons/ for uploaded icons
- Test icon URLs: `https://your-project.supabase.co/storage/v1/object/public/screenshots/entity-icons/filename.webp`

### 3. Frontend Verification
- Build project: `npm run build`
- Test Items & Schematics page
- Test POI linking functionality
- Verify icon display

## 🛠️ Troubleshooting

### Common Issues

1. **Icons not displaying:**
   - Check storage policies are applied
   - Verify icon files uploaded correctly
   - Check icon URL format in browser network tab

2. **Recipe data missing:**
   - Ensure all Excel files are processed
   - Check recipe foreign key relationships
   - Verify recipe_id formatting

3. **POI links broken:**
   - Check poi_entity_links migration
   - Verify entity IDs are correctly linked
   - Test with simple POI link creation

### Migration Rollback
If you need to rollback:
1. Restore database from backup
2. Remove entity icon files from Supabase storage
3. Revert frontend code changes

## 📞 Support

If you encounter issues during migration:
1. Check the console/logs for specific error messages
2. Verify all prerequisites are met
3. Ensure environment variables are correctly set
4. Test each step individually before proceeding

## 🎯 Next Steps

After successful migration:
1. Update documentation to reflect new structure
2. Train users on new unified interface
3. Consider adding recipe visualization features
4. Monitor performance and optimize queries as needed 