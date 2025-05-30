import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityItem } from '../../types';
import DiamondIcon from '../common/DiamondIcon';
import UserAvatar from '../common/UserAvatar';
import { 
  MapPin, 
  MessageSquare, 
  Eye, 
  Camera,
  User,
  Clock,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface ActivityFeedProps {
  limit?: number;
}

// Enhanced interface for activities with user data
interface EnhancedActivityItem extends ActivityItem {
  user?: {
    id: string;
    username: string;
    display_name?: string | null;
    discord_username?: string | null;
    custom_avatar_url?: string | null;
    discord_avatar_url?: string | null;
    use_discord_avatar?: boolean;
  };
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ limit = 20 }) => {
  const [activities, setActivities] = useState<EnhancedActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, discord_username, custom_avatar_url, discord_avatar_url, use_discord_avatar')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  };

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activities: EnhancedActivityItem[] = [];

      // Fetch recent POI creations
      const { data: recentPois, error: poisError } = await supabase
        .from('pois')
        .select(`
          id,
          title,
          created_at,
          created_by,
          updated_at,
          updated_by,
          grid_square_id
        `)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Fetch recent POI updates (simpler approach - get recently updated POIs)
      const { data: editedPois, error: editedPoisError } = await supabase
        .from('pois')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          updated_by,
          grid_square_id
        `)
        .not('updated_by', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Process POI creations
      if (recentPois && !poisError) {
        for (const poi of recentPois) {
          const profile = await fetchUserProfile(poi.created_by);

          let gridSquare = null;
          if (poi.grid_square_id) {
            const { data } = await supabase
              .from('grid_squares')
              .select('coordinate')
              .eq('id', poi.grid_square_id)
              .single();
            gridSquare = data;
          }

          activities.push({
            id: `poi-created-${poi.id}`,
            type: 'poi_created',
            title: `New POI: ${poi.title}`,
            description: `${gridSquare ? `in ${gridSquare.coordinate}` : ''}`,
            timestamp: poi.created_at,
            icon: 'MapPin',
            user: profile
          });
        }
      }

      // Process POI edits (filter client-side to avoid column comparison issues)
      if (editedPois && !editedPoisError) {
        for (const poi of editedPois) {
          // Only include if it was actually edited (updated_at != created_at and has updated_by)
          if (poi.updated_by && poi.updated_at && poi.updated_at !== poi.created_at) {
            const profile = await fetchUserProfile(poi.updated_by);

            let gridSquare = null;
            if (poi.grid_square_id) {
              const { data } = await supabase
                .from('grid_squares')
                .select('coordinate')
                .eq('id', poi.grid_square_id)
                .single();
              gridSquare = data;
            }

            activities.push({
              id: `poi-edited-${poi.id}-${poi.updated_at}`,
              type: 'poi_edited',
              title: `POI Updated: ${poi.title}`,
              description: `${gridSquare ? `in ${gridSquare.coordinate}` : ''}`,
              timestamp: poi.updated_at,
              icon: 'Edit',
              user: profile
            });
          }
        }
      }

      // Fetch recent comments
      const { data: recentComments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          created_by,
          updated_at,
          updated_by,
          poi_id
        `)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Fetch recently updated comments
      const { data: editedComments, error: editedCommentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          updated_by,
          poi_id
        `)
        .not('updated_by', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Process comment creations
      if (recentComments && !commentsError) {
        for (const comment of recentComments) {
          const author = await fetchUserProfile(comment.created_by);

          let poi = null;
          if (comment.poi_id) {
            const { data } = await supabase
              .from('pois')
              .select('title')
              .eq('id', comment.poi_id)
              .single();
            poi = data;
          }

          activities.push({
            id: `comment-created-${comment.id}`,
            type: 'comment_added',
            title: `New comment on ${poi?.title || 'POI'}`,
            description: `${comment.content.substring(0, 80)}${comment.content.length > 80 ? '...' : ''}`,
            timestamp: comment.created_at,
            icon: 'MessageSquare',
            user: author
          });
        }
      }

      // Process comment edits (filter client-side)
      if (editedComments && !editedCommentsError) {
        for (const comment of editedComments) {
          // Only include if it was actually edited
          if (comment.updated_by && comment.updated_at && comment.updated_at !== comment.created_at) {
            const editor = await fetchUserProfile(comment.updated_by);

            let poi = null;
            if (comment.poi_id) {
              const { data } = await supabase
                .from('pois')
                .select('title')
                .eq('id', comment.poi_id)
                .single();
              poi = data;
            }

            activities.push({
              id: `comment-edited-${comment.id}-${comment.updated_at}`,
              type: 'comment_edited',
              title: `Comment updated on ${poi?.title || 'POI'}`,
              description: `${comment.content.substring(0, 80)}${comment.content.length > 80 ? '...' : ''}`,
              timestamp: comment.updated_at,
              icon: 'Edit',
              user: editor
            });
          }
        }
      }

      // Fetch recent screenshots (grid squares with screenshots)
      const { data: recentScreenshots, error: screenshotsError } = await supabase
        .from('grid_squares')
        .select(`
          id,
          coordinate,
          upload_date,
          uploaded_by,
          screenshot_url
        `)
        .not('screenshot_url', 'is', null)
        .order('upload_date', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Process screenshot uploads
      if (recentScreenshots && !screenshotsError) {
        for (const screenshot of recentScreenshots) {
          const uploader = await fetchUserProfile(screenshot.uploaded_by);

          activities.push({
            id: `screenshot-${screenshot.id}`,
            type: 'screenshot_uploaded',
            title: `Screenshot uploaded for ${screenshot.coordinate}`,
            description: 'Grid exploration screenshot',
            timestamp: screenshot.upload_date,
            icon: 'Camera',
            user: uploader
          });
        }
      }

      // Sort all activities by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activities.slice(0, limit));
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  const getActivityIcon = (iconName: string) => {
    const iconMap = {
      MapPin: <MapPin size={14} strokeWidth={1.5} />,
      MessageSquare: <MessageSquare size={14} strokeWidth={1.5} />,
      Camera: <Camera size={14} strokeWidth={1.5} />,
      Eye: <Eye size={14} strokeWidth={1.5} />,
      User: <User size={14} strokeWidth={1.5} />,
      Edit: <Edit size={14} strokeWidth={1.5} />,
      Trash2: <Trash2 size={14} strokeWidth={1.5} />,
      AlertTriangle: <AlertTriangle size={14} strokeWidth={1.5} />,
    };
    return iconMap[iconName as keyof typeof iconMap] || <Clock size={14} strokeWidth={1.5} />;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const ActivityItemComponent: React.FC<{ activity: EnhancedActivityItem }> = ({ activity }) => (
    <div className="group relative">
      {/* Multi-layer background system */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
      
      {/* Interactive purple overlay */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-r from-violet-600/5 via-violet-700/3 to-transparent" />
      
      {/* Content */}
      <div className="relative p-4 rounded-lg border border-amber-400/10 hover:border-amber-300/20 transition-all duration-300">
        <div className="flex items-start gap-3">
          <DiamondIcon
            icon={getActivityIcon(activity.icon)}
            size="sm"
            bgColor="bg-void-950"
            actualBorderColor="bg-gold-300"
            borderThickness={1}
            iconColor="text-gold-300"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-light tracking-wide text-amber-200 truncate"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {activity.title}
                </h3>
                
                {/* User info and description */}
                <div className="flex items-center gap-2 mt-1">
                  {activity.user && (
                    <>
                      <UserAvatar 
                        user={activity.user}
                        size="xs"
                        className="flex-shrink-0"
                      />
                      <span className="text-xs font-medium text-amber-100 tracking-wide"
                            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        {activity.user.display_name || activity.user.discord_username || activity.user.username}
                      </span>
                      {activity.description && (
                        <>
                          <span className="text-amber-300/50">•</span>
                          <span className="text-xs font-thin text-amber-300/70">
                            {activity.description}
                          </span>
                        </>
                      )}
                    </>
                  )}
                  {!activity.user && activity.description && (
                    <span className="text-xs font-thin text-amber-300/70">
                      {activity.description}
                    </span>
                  )}
                </div>
              </div>
              
              <span className="text-xs font-light text-amber-300/50 tracking-wide whitespace-nowrap">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="relative p-4 rounded-lg border border-amber-400/10">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-amber-400/10 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-amber-400/10 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-amber-400/10 rounded animate-pulse w-1/2" />
                </div>
                <div className="h-3 bg-amber-400/10 rounded animate-pulse w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="relative p-6 rounded-lg border border-red-400/20 text-center">
          <DiamondIcon
            icon={<Clock size={16} strokeWidth={1.5} />}
            size="sm"
            bgColor="bg-void-950"
            actualBorderColor="bg-red-400"
            borderThickness={1}
            iconColor="text-red-400"
            className="mx-auto mb-3"
          />
          <p className="text-red-300/80 font-light tracking-wide">{error}</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="relative p-8 rounded-lg border border-amber-400/10 text-center">
          <DiamondIcon
            icon={<Eye size={16} strokeWidth={1.5} />}
            size="sm"
            bgColor="bg-void-950"
            actualBorderColor="bg-gold-300"
            borderThickness={1}
            iconColor="text-gold-300"
            className="mx-auto mb-3"
          />
          <p className="text-amber-300/70 font-light tracking-wide">
            No recent activity detected
          </p>
          <p className="text-xs text-amber-300/50 font-thin tracking-wide mt-1">
            Operations will appear here as they occur
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityItemComponent key={activity.id} activity={activity} />
      ))}
    </div>
  );
};

export default ActivityFeed; 