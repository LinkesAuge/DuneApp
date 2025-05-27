-- Add support for user-created POI types
-- This allows users to create custom POI types with their own icons and categories

-- Add created_by field to poi_types table (NULL means system/admin created)
ALTER TABLE public.poi_types 
ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance when filtering user-created types
CREATE INDEX idx_poi_types_created_by ON public.poi_types(created_by);

-- Add comment for documentation
COMMENT ON COLUMN public.poi_types.created_by IS 'User who created this POI type. NULL indicates system/admin created type.';

-- Update RLS policies to allow users to create and manage their own POI types
DROP POLICY IF EXISTS "Admins and editors can manage POI types" ON poi_types;

-- New policy: Everyone can read all POI types (system and user-created)
CREATE POLICY "POI types are viewable by everyone" ON poi_types
FOR SELECT
USING (true);

-- New policy: Admins can manage all POI types
CREATE POLICY "Admins can manage all POI types" ON poi_types
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- New policy: Users can create their own POI types
CREATE POLICY "Users can create custom POI types" ON poi_types
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() = created_by
);

-- New policy: Users can update their own POI types
CREATE POLICY "Users can update their own POI types" ON poi_types
FOR UPDATE
USING (
  auth.uid() = created_by
);

-- New policy: Users can delete their own POI types
CREATE POLICY "Users can delete their own POI types" ON poi_types
FOR DELETE
USING (
  auth.uid() = created_by
); 