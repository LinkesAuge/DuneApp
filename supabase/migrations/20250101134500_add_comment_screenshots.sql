-- Add comment screenshots support
-- Create comment_screenshots table
CREATE TABLE comment_screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_size INTEGER,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for comment_screenshots
ALTER TABLE comment_screenshots ENABLE ROW LEVEL SECURITY;

-- Anyone can view comment screenshots
CREATE POLICY "Anyone can view comment screenshots" ON comment_screenshots
  FOR SELECT USING (true);

-- Authenticated users can insert comment screenshots
CREATE POLICY "Authenticated users can insert comment screenshots" ON comment_screenshots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update/delete their own comment screenshots, admins can do anything
CREATE POLICY "Users can manage their own comment screenshots" ON comment_screenshots
  FOR ALL USING (
    auth.uid() = uploaded_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_comment_screenshots_comment_id ON comment_screenshots(comment_id);
CREATE INDEX idx_comment_screenshots_uploaded_by ON comment_screenshots(uploaded_by);
CREATE INDEX idx_comment_screenshots_upload_date ON comment_screenshots(upload_date);

-- Add constraint to limit screenshots per comment (max 5)
CREATE OR REPLACE FUNCTION check_comment_screenshot_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM comment_screenshots WHERE comment_id = NEW.comment_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 screenshots allowed per comment';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_screenshot_limit
  BEFORE INSERT ON comment_screenshots
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_screenshot_limit(); 