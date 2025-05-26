# Likes System & Emoji Support Installation Guide

This guide extends the existing comments system with likes and emoji support for both POIs and comments.

## Database Setup

### Step 1: Run the Likes Migration

Go to your Supabase Dashboard → SQL Editor and run the following SQL:

```sql
/*
  # Add Likes System

  1. New Tables
    - `likes` - Track user likes for comments and POIs

  2. Security
    - Enable RLS on likes table
    - Add policies for like management
*/

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- What is being liked (comment or POI)
  target_type text NOT NULL CHECK (target_type IN ('comment', 'poi')),
  target_id uuid NOT NULL,
  
  -- Prevent duplicate likes from same user
  UNIQUE(created_by, target_type, target_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(created_by);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at);

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Likes table policies

-- Everyone can read likes (for showing counts)
CREATE POLICY "Likes are viewable by everyone"
  ON likes
  FOR SELECT
  USING (true);

-- Authenticated users can insert likes
CREATE POLICY "Authenticated users can like items"
  ON likes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Users can delete their own likes (unlike)
CREATE POLICY "Users can unlike their own likes"
  ON likes
  FOR DELETE
  USING (auth.uid() = created_by);

-- Admins can manage any like
CREATE POLICY "Admins can manage any like"
  ON likes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

## New Features

### 1. Likes System

- **Like Comments**: Users can like comments from other users
- **Like POIs**: Users can like POI posts
- **Visual Feedback**: Heart icons that fill when liked, show counts
- **One Like Per User**: Database prevents duplicate likes
- **Real-time Updates**: Like counts update immediately

#### How Likes Work:
- Click the heart icon next to any comment or POI
- Filled red heart = you've liked it
- Empty heart = you haven't liked it
- Number shows total likes from all users
- Must be logged in to like items

### 2. Emoji Support

- **Enhanced Text Areas**: All comment forms now support emojis
- **Emoji Picker**: Click the smile icon for quick emoji access
- **Keyboard Shortcuts**: Use Windows + . or Windows + ; for more emojis
- **Common Emojis**: Quick access to 20 popular emojis
- **Cursor Position**: Emojis insert at your cursor position

#### Available Quick Emojis:
😀 😊 😄 😎 🤔 😮 😢 😡 👍 👎 ❤️ 🔥 ⭐ ✅ ❌ 💯 🎉 🚀 💎 ⚡

### 3. Enhanced Comment Experience

- **Edit with Emojis**: Edit existing comments with emoji support
- **Like Comments**: Show appreciation for helpful comments
- **Better UX**: More engaging and expressive communication

## UI/UX Changes

### Where You'll See Likes:
1. **POI Cards**: Like button appears below POI description
2. **Comments**: Like button appears below each comment
3. **Like Counts**: Shows total number of likes
4. **Visual States**: Different colors for liked/unliked items

### Where You'll See Emoji Support:
1. **Comment Forms**: Add new comments with emoji picker
2. **Comment Editing**: Edit existing comments with emoji support
3. **Keyboard Hints**: Helpful tips for emoji shortcuts

## Technical Details

### Database Schema

```sql
likes (
  id: uuid (primary key)
  created_at: timestamptz (auto)
  created_by: uuid (foreign key to profiles)
  target_type: text ('comment' or 'poi')
  target_id: uuid (id of the liked item)
)
```

### TypeScript Types

```typescript
interface Like {
  id: string;
  created_at: string;
  created_by: string;
  target_type: 'comment' | 'poi';
  target_id: string;
}

interface LikeStatus {
  likeCount: number;
  isLikedByUser: boolean;
  userLikeId?: string;
}
```

### New Components

1. **LikeButton**: Reusable component for any content type
2. **EmojiTextArea**: Enhanced textarea with emoji picker
3. **Updated CommentForm**: Now uses emoji textarea
4. **Updated CommentItem**: Now includes like button and emoji editing

### Component Usage

```typescript
// Like button for POIs
<LikeButton targetType="poi" targetId={poi.id} />

// Like button for comments
<LikeButton targetType="comment" targetId={comment.id} />

// Emoji textarea
<EmojiTextArea 
  value={text} 
  onChange={setText}
  placeholder="Type with emojis..." 
/>
```

## Troubleshooting

### Common Issues

1. **Likes not updating**: Check browser console for errors, ensure user is authenticated
2. **Emoji picker not showing**: Click the smile icon in text areas
3. **Duplicate like errors**: Database prevents this, but UI should handle gracefully

### Performance Notes

- Like counts are fetched efficiently with count queries
- Emoji picker uses common emojis for fast loading
- Components only fetch data when needed

## Future Enhancements

Possible future improvements:
- Reaction types (laugh, heart, thumbs up, etc.)
- Like notifications
- Most liked content filtering
- Emoji reactions on POIs themselves
- Custom emoji upload 