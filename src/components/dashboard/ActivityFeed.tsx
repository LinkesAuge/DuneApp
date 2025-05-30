import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityItem } from '../../types';
import DiamondIcon from '../common/DiamondIcon';
import { 
  MapPin, 
  MessageSquare, 
  Eye, 
  Camera,
  User,
  Clock
} from 'lucide-react';

interface ActivityFeedProps {
  limit?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ limit = 20 }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activities: ActivityItem[] = [];

      // Fetch recent POIs with manual joins
      const { data: recentPois, error: poisError } = await supabase
        .from('pois')
        .select(`
          id,
          title,
          created_at,
          created_by,
          grid_square_id
        `)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Fetch usernames and coordinates separately
      let poisWithDetails = [];
      if (recentPois && !poisError) {
        for (const poi of recentPois) {
          // Get username only if created_by is not null
          let profile = null;
          if (poi.created_by) {
            const { data } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', poi.created_by)
              .single();
            profile = data;
          }

          // Get grid square coordinate if grid_square_id exists
          let gridSquare = null;
          if (poi.grid_square_id) {
            const { data } = await supabase
              .from('grid_squares')
              .select('coordinate')
              .eq('id', poi.grid_square_id)
              .single();
            gridSquare = data;
          }

          poisWithDetails.push({
            ...poi,
            profile,
            grid_square: gridSquare
          });
        }

        // Add POI activities
        for (const poi of poisWithDetails) {
          activities.push({
            id: `poi-${poi.id}`,
            type: 'poi_created',
            title: `New POI: ${poi.title}`,
            description: `Added by ${poi.profile?.username || 'Anonymous'}${poi.grid_square ? ` in ${poi.grid_square.coordinate}` : ''}`,
            timestamp: poi.created_at,
            icon: 'MapPin'
          });
        }
      }

      // Fetch recent comments with manual joins
      const { data: recentComments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          author_id,
          poi_id
        `)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      let commentsWithDetails = [];
      if (recentComments && !commentsError) {
        for (const comment of recentComments) {
          // Get author username
          let author = null;
          if (comment.author_id) {
            const { data } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', comment.author_id)
              .single();
            author = data;
          }

          // Get POI title
          let poi = null;
          if (comment.poi_id) {
            const { data } = await supabase
              .from('pois')
              .select('title')
              .eq('id', comment.poi_id)
              .single();
            poi = data;
          }

          commentsWithDetails.push({
            ...comment,
            author,
            poi
          });
        }

        // Add comment activities
        for (const comment of commentsWithDetails) {
          activities.push({
            id: `comment-${comment.id}`,
            type: 'comment_added',
            title: `New comment on ${comment.poi?.title || 'POI'}`,
            description: `Comment by ${comment.author?.username || 'Anonymous'}: ${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}`,
            timestamp: comment.created_at,
            icon: 'MessageSquare'
          });
        }
      }

      // Fetch recent screenshots (grid squares with screenshots)
      const { data: recentScreenshots, error: screenshotsError } = await supabase
        .from('grid_squares')
        .select(`
          id,
          coordinate,
          created_at,
          uploader_id,
          screenshot_url
        `)
        .not('screenshot_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      let screenshotsWithDetails = [];
      if (recentScreenshots && !screenshotsError) {
        for (const screenshot of recentScreenshots) {
          // Get uploader username
          let uploader = null;
          if (screenshot.uploader_id) {
            const { data } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', screenshot.uploader_id)
              .single();
            uploader = data;
          }

          screenshotsWithDetails.push({
            ...screenshot,
            uploader
          });
        }

        // Add screenshot activities
        for (const screenshot of screenshotsWithDetails) {
          activities.push({
            id: `screenshot-${screenshot.id}`,
            type: 'screenshot_uploaded',
            title: `Screenshot uploaded for ${screenshot.coordinate}`,
            description: `Uploaded by ${screenshot.uploader?.username || 'Anonymous'}`,
            timestamp: screenshot.created_at,
            icon: 'Camera'
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

  const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({ activity }) => (
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
                <p className="text-xs font-thin text-amber-300/70 mt-1 line-clamp-2">
                  {activity.description}
                </p>
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