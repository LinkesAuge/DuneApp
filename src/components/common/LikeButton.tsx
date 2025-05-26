import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LikeStatus } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  targetType: 'comment' | 'poi';
  targetId: string;
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LikeButton: React.FC<LikeButtonProps> = ({
  targetType,
  targetId,
  className = '',
  showCount = true,
  size = 'sm'
}) => {
  const { user } = useAuth();
  const [likeStatus, setLikeStatus] = useState<LikeStatus>({
    likeCount: 0,
    isLikedByUser: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm', 
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  const fetchLikeStatus = async () => {
    try {
      // Get total like count
      const { count, error: countError } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      if (countError) throw countError;

      let userLike = null;
      if (user) {
        // Check if current user has liked this item
        const { data: userLikeData, error: userLikeError } = await supabase
          .from('likes')
          .select('id')
          .eq('target_type', targetType)
          .eq('target_id', targetId)
          .eq('created_by', user.id)
          .maybeSingle();

        if (userLikeError) throw userLikeError;
        userLike = userLikeData;
      }

      setLikeStatus({
        likeCount: count || 0,
        isLikedByUser: !!userLike,
        userLikeId: userLike?.id
      });
    } catch (err: any) {
      console.error('Error fetching like status:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchLikeStatus();
  }, [targetType, targetId, user]);

  const handleLikeToggle = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      if (likeStatus.isLikedByUser && likeStatus.userLikeId) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', likeStatus.userLikeId);

        if (deleteError) throw deleteError;

        setLikeStatus(prev => ({
          likeCount: Math.max(0, prev.likeCount - 1),
          isLikedByUser: false,
          userLikeId: undefined
        }));
      } else {
        // Like
        const { data, error: insertError } = await supabase
          .from('likes')
          .insert({
            target_type: targetType,
            target_id: targetId,
            created_by: user.id
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        setLikeStatus(prev => ({
          likeCount: prev.likeCount + 1,
          isLikedByUser: true,
          userLikeId: data.id
        }));
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
      setError(err.message);
      // Revert optimistic update on error
      fetchLikeStatus();
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className={`text-xs text-red-500 ${className}`}>
        Like error
      </div>
    );
  }

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading || !user}
      className={`
        flex items-center gap-1 transition-all duration-200 hover:scale-105
        ${user ? 'cursor-pointer' : 'cursor-not-allowed'} 
        ${likeStatus.isLikedByUser 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-sand-600 hover:text-red-500'
        }
        ${sizeClasses[size]}
        ${className}
      `}
      title={user ? (likeStatus.isLikedByUser ? 'Unlike' : 'Like') : 'Sign in to like'}
    >
      <Heart 
        size={iconSizes[size]} 
        className={`${isLoading ? 'animate-pulse' : ''}`}
        fill={likeStatus.isLikedByUser ? 'currentColor' : 'none'}
      />
      {showCount && (
        <span className="font-medium">
          {likeStatus.likeCount}
        </span>
      )}
    </button>
  );
};

export default LikeButton; 