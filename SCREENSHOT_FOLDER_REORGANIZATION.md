# Screenshot Folder Reorganization - Implementation Guide

This document outlines the comprehensive reorganization of screenshot storage from mixed folders to dedicated original/cropped folder structure.

## 🎯 **Objective**

Reorganize screenshot storage to use dedicated folders:
- `poi_screenshots_original/` - Original uncropped POI screenshots
- `poi_screenshots_cropped/` - Cropped/display POI screenshots  
- `comment_screenshots_original/` - Original uncropped comment screenshots
- `comment_screenshots_cropped/` - Cropped/display comment screenshots

## 📋 **Changes Implemented**

### 1. Database Schema Updates

**File:** `supabase/migrations/add_comment_screenshot_structure.sql`
- Added `original_url` column to `comment_screenshots` table
- Added `crop_details` JSONB column for storing crop coordinates
- Added `updated_by` and `updated_at` columns for audit trail
- Added proper indexes and RLS policies

### 2. Upload Function Enhancements

**File:** `src/lib/imageUpload.ts`
- ✅ Added `uploadPoiScreenshotOriginal()` - uploads to `poi_screenshots_original/`
- ✅ Added `uploadPoiScreenshotCropped()` - uploads to `poi_screenshots_cropped/`
- ✅ Added `uploadCommentScreenshotOriginal()` - uploads to `comment_screenshots_original/`
- ✅ Added `uploadCommentScreenshotCropped()` - uploads to `comment_screenshots_cropped/`
- ✅ Marked legacy functions as deprecated with proper JSDoc
- ✅ Enhanced quality settings (high for originals, standard for cropped)

### 3. POI Screenshot System Updates

**File:** `src/components/hagga-basin/POIEditModal.tsx`
- ✅ Updated imports to use new upload functions
- ✅ Modified upload logic to save both original and cropped versions
- ✅ Enhanced file path structure: `{poi_id}/{screenshot_id}_original.webp`
- ✅ Added enhanced path extraction function for proper file deletion
- ✅ Updated deletion logic to handle new folder structures

### 4. Comment Screenshot System Updates

**File:** `src/components/comments/CommentForm.tsx`
- ✅ Updated imports to use new upload functions
- ✅ Enhanced `ScreenshotFile` interface to track both `originalFile` and `displayFile`
- ✅ Modified crop handling to preserve original files
- ✅ Updated upload logic to save both versions with proper metadata
- ✅ Enhanced database insertion to include `original_url` and `crop_details`

**File:** `src/components/comments/CommentsList.tsx`
- ✅ Updated database queries to fetch new columns (`original_url`, `crop_details`, etc.)

### 5. Deletion System Enhancements

**File:** `src/lib/api/pois.ts`
- ✅ Enhanced `deletePOIWithCleanup()` to handle both original and cropped files
- ✅ Updated path extraction to support all folder structures (new + legacy)
- ✅ Added comprehensive error handling for partial deletion scenarios
- ✅ Enhanced comment screenshot cleanup to handle both file types

## 🗂️ **Folder Structure**

### Before (Legacy)
```
screenshots/
├── poi_originals/{poi_id}/
├── poi_screenshots/{poi_id}/
└── comment-screenshots/{user_id}/
```

### After (New Structure)
```
screenshots/
├── poi_screenshots_original/{poi_id}/
├── poi_screenshots_cropped/{poi_id}/
├── comment_screenshots_original/{user_id}/
└── comment_screenshots_cropped/{user_id}/
```

## 🔄 **Migration Strategy**

### Backward Compatibility
- ✅ Legacy upload functions maintained with deprecation warnings
- ✅ Enhanced path extraction supports both old and new folder structures
- ✅ Deletion logic handles mixed folder scenarios gracefully

### File Naming Convention
- **POI Screenshots:** `{poi_id}/{screenshot_id}_original.webp` / `{poi_id}/{screenshot_id}_display.webp`
- **Comment Screenshots:** `{user_id}/{screenshot_id}_original.webp` / `{user_id}/{screenshot_id}_display.webp`

## 🧪 **Testing Checklist**

### POI Screenshot Testing
- [ ] Upload new POI screenshots (should create both original and cropped versions)
- [ ] Edit existing POI screenshots (should preserve original, create new cropped)
- [ ] Delete POI screenshots (should remove both original and cropped files)
- [ ] Delete entire POI (should clean up all associated files)

### Comment Screenshot Testing  
- [ ] Upload new comment screenshots (should create both versions)
- [ ] Delete individual comment screenshots
- [ ] Delete comments with screenshots (should clean up all files)
- [ ] Delete POI with comments containing screenshots

### Database Testing
- [ ] Run migration script: `add_comment_screenshot_structure.sql`
- [ ] Verify new columns exist in `comment_screenshots` table
- [ ] Test RLS policies for new columns

### Storage Testing
- [ ] Verify new folder structure is created in Supabase Storage
- [ ] Check file organization in dedicated folders
- [ ] Confirm proper file cleanup during deletions

## 🚀 **Deployment Steps**

1. **Database Migration**
   ```sql
   -- Run in Supabase SQL Editor
   \i supabase/migrations/add_comment_screenshot_structure.sql
   ```

2. **Code Deployment**
   - Deploy updated frontend code
   - Monitor for any upload/deletion errors
   - Verify new folder structure creation

3. **Verification**
   - Test upload workflows for both POI and comment screenshots
   - Verify proper file organization in storage buckets
   - Test deletion workflows for comprehensive cleanup

## 🔧 **Configuration Notes**

### Quality Settings
- **Original Files:** High quality (2048x2048 max, high compression)
- **Cropped Files:** Standard quality (1920x1920 max, standard compression)

### Storage Buckets
- All files continue to use the `screenshots` bucket
- Organization is handled through folder structure
- Proper RLS policies ensure access control

## 📊 **Benefits**

1. **Organization:** Clear separation of original vs processed files
2. **Storage Efficiency:** Optimized quality settings for different use cases  
3. **Data Integrity:** Original files always preserved for re-cropping
4. **Cleanup:** Comprehensive deletion ensures no orphaned files
5. **Scalability:** Dedicated folders support future enhancements

## 🚨 **Important Notes**

- **Backward Compatibility:** System supports both old and new folder structures
- **File Preservation:** Original files are always preserved during cropping operations
- **Comprehensive Cleanup:** Deletion operations handle both file types properly
- **Error Handling:** Partial deletion failures are logged but don't break core functionality
- **Performance:** Enhanced path extraction handles multiple folder patterns efficiently

## 🔍 **Monitoring**

After deployment, monitor:
- Upload success rates for both file types
- Storage folder organization
- Deletion operation completeness
- Any path extraction errors in logs
- Database constraint violations (should be none)

This reorganization provides a solid foundation for future screenshot management enhancements while maintaining full backward compatibility with existing data. 