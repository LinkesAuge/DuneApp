import React from 'react';
import { User } from 'lucide-react';
import { User as UserType } from '../../types';
import { getDisplayAvatarUrl } from '../../lib/avatarUtils';

interface UserAvatarProps {
  user: UserType | { custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showBorder = true,
  borderColor = 'border-gold-300/50'
}) => {
  // Size mappings
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const iconSizes = {
    xs: 8,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24
  };

  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];
  const borderClass = showBorder ? borderColor : '';

  // Get avatar URL - handle both full User objects and partial user objects
  const getAvatarUrl = () => {
    if (!user) return '/default-avatar.png';
    
    // If it's a full User object, use the utility function
    if ('id' in user && 'email' in user) {
      return getDisplayAvatarUrl(user as UserType);
    }
    
    // For partial user objects (like from POI cards), apply the same preference logic
    // If user prefers Discord avatar and has one, use it
    if (user.use_discord_avatar !== false && user.discord_avatar_url) {
      return user.discord_avatar_url;
    }
    
    // If user prefers custom avatar and has one, use it
    if (user.use_discord_avatar === false && user.custom_avatar_url) {
      return user.custom_avatar_url;
    }
    
    // Fallback: try custom first, then Discord
    if (user.custom_avatar_url) {
      return user.custom_avatar_url;
    }
    
    if (user.discord_avatar_url) {
      return user.discord_avatar_url;
    }
    
    return '/default-avatar.png';
  };

  const avatarUrl = getAvatarUrl();

  if (avatarUrl !== '/default-avatar.png') {
    return (
      <img
        src={avatarUrl}
        alt="User Avatar"
        className={`${sizeClass} rounded-full ${borderClass} object-cover ${className}`}
      />
    );
  }

  // Default avatar (User icon)
  return (
    <div className={`${sizeClass} rounded-full bg-void-950 ${borderClass} flex items-center justify-center ${className}`}>
      <User size={iconSize} className="text-gold-300/70" />
    </div>
  );
};

export default UserAvatar; 