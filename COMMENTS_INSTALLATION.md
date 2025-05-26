# Comments System Installation Guide

A complete comment system has been implemented for both POIs and Grid Squares. This guide will help you set it up.

## Database Setup

### Step 1: Run the Migration

You need to apply the database migration to create the comments table. 

**Option A: Using Supabase CLI (Recommended)**
```bash
npx supabase db push
```

**Option B: Manual SQL Execution (if CLI doesn't work)**
Go to your Supabase Dashboard → SQL Editor and run the following SQL:

```sql
/*
  # Add Comments System

  1. New Tables
    - `comments` - Comments for POIs and Grid Squares

  2. Security
    - Enable RLS on comments table
    - Add policies for comment management
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Reference either a POI or a Grid Square (one of these should be null)
  poi_id uuid REFERENCES pois(id) ON DELETE CASCADE,
  grid_square_id uuid REFERENCES grid_squares(id) ON DELETE CASCADE,
  
  -- Ensure comment is linked to exactly one entity
  CONSTRAINT comment_target_check CHECK (
    (poi_id IS NOT NULL AND grid_square_id IS NULL) OR 
    (poi_id IS NULL AND grid_square_id IS NOT NULL)
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_comments_poi_id ON comments(poi_id);
CREATE INDEX IF NOT EXISTS idx_comments_grid_square_id ON comments(grid_square_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments table policies

-- Everyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  USING (auth.uid() = created_by);

-- Admins can manage any comment
CREATE POLICY "Admins can manage any comment"
  ON comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Features

### What's Included

1. **Comment Components**:
   - `CommentForm`: For adding new comments
   - `CommentItem`: For displaying individual comments with edit/delete
   - `CommentsList`: Main component that handles all comment functionality

2. **Integration Points**:
   - **POI Cards**: Comments section added at the bottom of each POI card
   - **Grid Square Modal**: Comments section in the right sidebar below POI list

3. **Permissions**:
   - **Anyone**: Can view comments
   - **Authenticated Users**: Can add comments
   - **Comment Authors**: Can edit/delete their own comments
   - **Admins**: Can edit/delete any comment

4. **Features**:
   - Real-time relative timestamps (e.g., "2h ago", "Just now")
   - Edit indicator for modified comments
   - Collapsible comment sections with comment count
   - Responsive design matching the app's theme
   - Error handling and loading states

### How to Use

1. **View Comments**: Click on any POI card or open a Grid Square modal to see the comments section
2. **Add Comments**: Use the text area at the bottom of the comments section (requires login)
   - Optionally add up to 5 screenshots per comment
   - Supports JPEG, PNG, WebP formats (max 2MB each)
3. **Edit Comments**: Click the edit icon on your own comments
   - Edit text content and manage screenshots
   - Mark existing screenshots for deletion (red X button, shows grayed out with "Will Delete" overlay)
   - Add new screenshots (marked with blue border and "NEW" label)
   - Summary shows planned changes before saving
4. **Delete Comments**: Click the trash icon on your own comments (or any comment if you're an admin)
5. **View Screenshots**: Click on any screenshot to open the gallery modal with navigation

### UI/UX Details

- Comments are **collapsed by default** to avoid overwhelming the interface
- Click "Comments (X)" to expand and see all comments
- Comments show username, relative time, and edit status
- Form validation ensures no empty comments
- Smooth animations and loading states for better user experience

## Technical Details

### Database Schema

```sql
comments (
  id: uuid (primary key)
  content: text (required)
  created_at: timestamptz (auto)
  updated_at: timestamptz (auto, triggered)
  created_by: uuid (foreign key to profiles)
  poi_id: uuid (foreign key to pois, nullable)
  grid_square_id: uuid (foreign key to grid_squares, nullable)
)
```

### TypeScript Types

```typescript
interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  poi_id?: string;
  grid_square_id?: string;
}

interface CommentWithUser extends Comment {
  user?: {
    username: string;
  };
}
```

### Component Usage

```typescript
// For POI comments
<CommentsList poiId={poi.id} />

// For Grid Square comments
<CommentsList gridSquareId={gridSquare.id} />

// With initial expanded state
<CommentsList poiId={poi.id} initiallyExpanded={true} />
```

## Troubleshooting

### Common Issues

1. **Migration Fails**: Make sure you have the necessary permissions in your Supabase project
2. **Comments Not Loading**: Check that RLS policies are correctly applied
3. **Can't Add Comments**: Ensure user is authenticated and has a profile in the profiles table

### Verification

After installation, you should be able to:
1. See "Comments (0)" sections on POI cards and Grid Square modals
2. Add comments when logged in
3. Edit/delete your own comments
4. See real-time comment counts

## Performance Considerations

- Comments are only loaded when the section is expanded (lazy loading)
- Database indexes on `poi_id`, `grid_square_id`, and `created_at` for fast queries
- Comment queries include user information in a single join
- Efficient re-rendering through proper React key usage

The comment system is now fully functional and integrated into your Dune Awakening Deep Desert Tracker! 