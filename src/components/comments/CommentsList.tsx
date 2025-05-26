import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CommentWithUser } from '../../types';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import LikeButton from '../common/LikeButton';
import ImageGallery from '../common/ImageGallery';

interface CommentsListProps {
  poiId?: string;
  gridSquareId?: string;
  initiallyExpanded?: boolean;
  showLikeButton?: boolean;
  likeTargetType?: 'comment' | 'poi';
  likeTargetId?: string;
}

const CommentsList: React.FC<CommentsListProps> = ({
  poiId,
  gridSquareId,
  initiallyExpanded = false,
  showLikeButton = false,
  likeTargetType,
  likeTargetId
}) => {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const fetchCommentCount = async () => {
    try {
      const query = supabase
        .from('comments')
        .select('id', { count: 'exact', head: true });

      if (poiId) {
        query.eq('poi_id', poiId);
      } else if (gridSquareId) {
        query.eq('grid_square_id', gridSquareId);
      }

      const { count, error: countError } = await query;

      if (countError) throw countError;

      setCommentCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching comment count:', err);
    }
  };

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = supabase
        .from('comments')
        .select(`
          *,
          user:profiles(username),
          screenshots:comment_screenshots(
            id,
            url,
            uploaded_by,
            upload_date,
            file_size,
            file_name
          )
        `)
        .order('created_at', { ascending: true });

      if (poiId) {
        query.eq('poi_id', poiId);
      } else if (gridSquareId) {
        query.eq('grid_square_id', gridSquareId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const commentsData = data || [];
      setComments(commentsData);
      setCommentCount(commentsData.length);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comment count on mount, full comments only when expanded
  useEffect(() => {
    if (isExpanded) {
      fetchComments();
    } else {
      fetchCommentCount();
    }
  }, [poiId, gridSquareId, isExpanded]);

  const handleCommentAdded = () => {
    if (isExpanded) {
      fetchComments();
    } else {
      fetchCommentCount();
    }
  };

  const handleCommentUpdated = () => {
    if (isExpanded) {
      fetchComments();
    } else {
      fetchCommentCount();
    }
  };

  const handleCommentDeleted = () => {
    if (isExpanded) {
      fetchComments();
    } else {
      fetchCommentCount();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleImageClick = (imageUrl: string, allImages: string[]) => {
    const index = allImages.findIndex(url => url === imageUrl);
    setGalleryImages(allImages);
    setGalleryIndex(Math.max(0, index));
    setShowImageGallery(true);
  };

  return (
    <div className="border border-sand-300 rounded-lg">
      <button
        onClick={toggleExpanded}
        className="w-full flex justify-between items-center p-4 text-left hover:bg-sand-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageSquare size={18} className="text-sand-600" />
          <span className="font-medium text-night-800">
            Comments ({commentCount})
          </span>
          {showLikeButton && likeTargetType && likeTargetId && (
            <div onClick={(e) => e.stopPropagation()}>
              <LikeButton 
                targetType={likeTargetType}
                targetId={likeTargetId}
                size="md"
              />
            </div>
          )}
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isExpanded && (
        <div className="border-t border-sand-300 p-4 space-y-4">
          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
              Error loading comments: {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spice-600"></div>
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <div className="text-center py-6 text-sand-600">
                  <MessageSquare className="mx-auto mb-2" size={32} />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onCommentUpdated={handleCommentUpdated}
                      onCommentDeleted={handleCommentDeleted}
                      onImageClick={handleImageClick}
                    />
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-sand-200">
                <CommentForm
                  poiId={poiId}
                  gridSquareId={gridSquareId}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Image Gallery */}
      {showImageGallery && (
        <ImageGallery
          images={galleryImages}
          initialIndex={galleryIndex}
          onClose={() => setShowImageGallery(false)}
          title="Comment Screenshots"
        />
      )}
    </div>
  );
};

export default CommentsList; 