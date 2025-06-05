# Screenshot Issues Fix Guide

This document outlines the fixes for two critical screenshot issues in the POI system.

## 🚨 **Issues Fixed**

### 1. **Multiple Screenshot Upload Limited to 2 Files**
**Problem**: When selecting more than 2 screenshots for upload, only the first 2 would go through the crop process, and the rest would be skipped.

**Root Cause**: The `processFilesForCropping` function was storing remaining files as a property on the File object, which is unreliable and caused the file queue to be lost.

**Solution**: 
- Added dedicated `filesToProcess` state to track files waiting for cropping
- Updated crop completion handlers to properly process all files in sequence
- Added queue clearing when crop modal is closed

### 2. **Screenshots Not Cleaned Up When Deleting POIs**
**Problem**: Screenshot files were not being deleted from Supabase storage when POIs were deleted, causing storage bloat.

**Root Cause**: Database migration for `original_url` and `crop_details` columns hasn't been run yet, causing the cleanup function to fail when trying to access these new columns.

**Solutions**:
- Added fallback logic to handle missing `original_url` column gracefully
- Enhanced the deletion cleanup system with better error handling

## 🔄 **Database Migration Required**

To fully resolve the screenshot cleanup issue, you need to run the database migration:

### **Option 1: Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add original_url and crop_details columns to comment_screenshots table
-- This enables support for separate original and cropped comment screenshot storage

-- Add original_url column to store the uncropped/original version of the screenshot
ALTER TABLE comment_screenshots 
ADD COLUMN IF NOT EXISTS original_url TEXT;

-- Add crop_details column to store the crop information (JSON format)
-- This will store the crop coordinates and dimensions for reproducing the crop
ALTER TABLE comment_screenshots 
ADD COLUMN IF NOT EXISTS crop_details JSONB;

-- Add updated_by and updated_at columns for audit trail when screenshots are re-cropped
ALTER TABLE comment_screenshots 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for better performance on these new columns
CREATE INDEX IF NOT EXISTS idx_comment_screenshots_original_url ON comment_screenshots(original_url);
CREATE INDEX IF NOT EXISTS idx_comment_screenshots_updated_by ON comment_screenshots(updated_by);
CREATE INDEX IF NOT EXISTS idx_comment_screenshots_updated_at ON comment_screenshots(updated_at);

-- Add comments to document the new columns
COMMENT ON COLUMN comment_screenshots.original_url IS 'URL of the original uncropped screenshot file';
COMMENT ON COLUMN comment_screenshots.crop_details IS 'JSON object containing crop coordinates and dimensions for reproducing the crop';
COMMENT ON COLUMN comment_screenshots.updated_by IS 'User who last updated/re-cropped this screenshot';
COMMENT ON COLUMN comment_screenshots.updated_at IS 'Timestamp when this screenshot was last updated/re-cropped';
```

4. Click **Run** to execute the migration
5. Verify no errors occurred

### **Option 2: Command Line (If Supabase CLI is available)**
```bash
supabase db push
```

## ✅ **Verification Steps**

After running the migration, verify both fixes:

### **Test Multiple Screenshot Upload**
1. Edit a POI
2. Click "Add Screenshots"
3. Select **3 or more** image files
4. Verify that ALL files go through the crop process one by one
5. Confirm all screenshots are uploaded successfully

### **Test Screenshot Cleanup**
1. Create a test POI with screenshots
2. Add some comments with screenshots to the POI
3. Delete the POI
4. Check console for any cleanup warnings - should be none
5. Verify that no orphaned files remain in storage

## 🛠 **Changes Made**

### **Files Modified**
- `src/components/hagga-basin/POIEditModal.tsx` - Fixed multiple screenshot processing
- `src/lib/api/pois.ts` - Enhanced deletion cleanup with fallback handling
- `supabase/migrations/add_comment_screenshot_structure.sql` - Database schema enhancement

### **Key Improvements**
1. **Reliable File Queue Management**: Uses proper React state instead of file object properties
2. **Sequential Processing**: All files are processed through crop modal one by one
3. **Graceful Degradation**: Cleanup works even when new database columns don't exist yet
4. **Better Error Handling**: Comprehensive error tracking and user feedback
5. **Storage Organization**: Files stored in dedicated original/cropped folders

## 📝 **Future Considerations**

- Monitor storage usage to ensure cleanup is working effectively
- Consider implementing storage usage analytics
- Plan for migration of existing files to new folder structure if needed
- Add user notifications for successful bulk screenshot uploads 