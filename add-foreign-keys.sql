-- Add missing foreign key relationships for dashboard queries
-- Run this ONLY IF the check-foreign-keys.sql shows missing relationships

-- Add foreign key from pois.created_by to profiles.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'pois' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name = 'pois_created_by_fkey'
    ) THEN
        ALTER TABLE pois 
        ADD CONSTRAINT pois_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES profiles(id);
    END IF;
END $$;

-- Add foreign key from comments.created_by to profiles.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'comments' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name = 'comments_created_by_fkey'
    ) THEN
        ALTER TABLE comments 
        ADD CONSTRAINT comments_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES profiles(id);
    END IF;
END $$;

-- Add foreign key from grid_squares.uploaded_by to profiles.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'grid_squares' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name = 'grid_squares_uploaded_by_fkey'
    ) THEN
        ALTER TABLE grid_squares 
        ADD CONSTRAINT grid_squares_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) REFERENCES profiles(id);
    END IF;
END $$;

-- Add foreign key from comment_screenshots.uploaded_by to profiles.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'comment_screenshots' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name = 'comment_screenshots_uploaded_by_fkey'
    ) THEN
        ALTER TABLE comment_screenshots 
        ADD CONSTRAINT comment_screenshots_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) REFERENCES profiles(id);
    END IF;
END $$;

-- Add foreign key from pois.grid_square_id to grid_squares.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'pois' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name = 'pois_grid_square_id_fkey'
    ) THEN
        ALTER TABLE pois 
        ADD CONSTRAINT pois_grid_square_id_fkey 
        FOREIGN KEY (grid_square_id) REFERENCES grid_squares(id);
    END IF;
END $$;

-- Add foreign key from comments.poi_id to pois.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'comments' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name = 'comments_poi_id_fkey'
    ) THEN
        ALTER TABLE comments 
        ADD CONSTRAINT comments_poi_id_fkey 
        FOREIGN KEY (poi_id) REFERENCES pois(id);
    END IF;
END $$;

-- Add foreign key from comments.grid_square_id to grid_squares.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'comments' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name = 'comments_grid_square_id_fkey'
    ) THEN
        ALTER TABLE comments 
        ADD CONSTRAINT comments_grid_square_id_fkey 
        FOREIGN KEY (grid_square_id) REFERENCES grid_squares(id);
    END IF;
END $$;

-- Add foreign key from comment_screenshots.comment_id to comments.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'comment_screenshots' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name = 'comment_screenshots_comment_id_fkey'
    ) THEN
        ALTER TABLE comment_screenshots 
        ADD CONSTRAINT comment_screenshots_comment_id_fkey 
        FOREIGN KEY (comment_id) REFERENCES comments(id);
    END IF;
END $$; 