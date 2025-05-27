import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ActivityItem } from '../../types';
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

          // Get coordinate
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
            profiles: { username: profile?.username || 'Unknown User' },
            grid_squares: { coordinate: gridSquare?.coordinate || 'Unknown' }
          });
        }
      }

      if (poisError) throw poisError;

      poisWithDetails?.forEach(poi => {
        activities.push({
          id: `poi_${poi.id}`,
          type: 'poi_created',
          title: 'New POI Created',
          description: poi.title,
          user: { username: poi.profiles?.username || 'Unknown User' },
          timestamp: poi.created_at,
          targetId: poi.id,
          targetType: 'poi',
          metadata: {
            coordinate: poi.grid_squares?.coordinate,
            poiTitle: poi.title
          }
        });
      });

      // Fetch recent comments with manual joins
      const { data: recentComments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          created_by,
          poi_id,
          grid_square_id
        `)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Fetch additional details separately
      let commentsWithDetails = [];
      if (recentComments && !commentsError) {
        for (const comment of recentComments) {
          // Get username only if created_by is not null
          let profile = null;
          if (comment.created_by) {
            const { data } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', comment.created_by)
              .single();
            profile = data;
          }

          // Get POI title if poi_id exists
          let poiTitle = null;
          if (comment.poi_id) {
            const { data: poi } = await supabase
              .from('pois')
              .select('title')
              .eq('id', comment.poi_id)
              .single();
            poiTitle = poi?.title;
          }

          // Get grid coordinate if grid_square_id exists
          let coordinate = null;
          if (comment.grid_square_id) {
            const { data: gridSquare } = await supabase
              .from('grid_squares')
              .select('coordinate')
              .eq('id', comment.grid_square_id)
              .single();
            coordinate = gridSquare?.coordinate;
          }

          commentsWithDetails.push({
            ...comment,
            profiles: { username: profile?.username || 'Unknown User' },
            pois: poiTitle ? { title: poiTitle } : null,
            grid_squares: coordinate ? { coordinate } : null
          });
        }
      }

      if (commentsError) throw commentsError;

      commentsWithDetails?.forEach(comment => {
        const target = comment.pois?.title || comment.grid_squares?.coordinate || 'Unknown';
        const targetType = comment.poi_id ? 'poi' : 'grid_square';
        
        activities.push({
          id: `comment_${comment.id}`,
          type: 'comment_added',
          title: 'New Comment',
          description: comment.content.length > 100 ? 
            comment.content.substring(0, 100) + '...' : 
            comment.content,
          user: { username: comment.profiles?.username || 'Unknown User' },
          timestamp: comment.created_at,
          targetId: comment.poi_id || comment.grid_square_id || '',
          targetType: targetType,
          metadata: {
            coordinate: comment.grid_squares?.coordinate,
            poiTitle: comment.pois?.title
          }
        });
      });

      // Fetch recent grid square explorations with manual joins
      const { data: recentExplorations, error: explorationsError } = await supabase
        .from('grid_squares')
        .select(`
          id,
          coordinate,
          upload_date,
          uploaded_by
        `)
        .eq('is_explored', true)
        .order('upload_date', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Fetch usernames separately
      let explorationsWithDetails = [];
      if (recentExplorations && !explorationsError) {
        for (const exploration of recentExplorations) {
          // Get username only if uploaded_by is not null
          let profile = null;
          if (exploration.uploaded_by) {
            const { data } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', exploration.uploaded_by)
              .single();
            profile = data;
          }

          explorationsWithDetails.push({
            ...exploration,
            profiles: { username: profile?.username || 'Unknown User' }
          });
        }
      }

      if (explorationsError) throw explorationsError;

      explorationsWithDetails?.forEach(grid => {
        activities.push({
          id: `grid_${grid.id}`,
          type: 'grid_explored',
          title: 'Grid Square Explored',
          description: `Grid square ${grid.coordinate} marked as explored`,
          user: { username: grid.profiles?.username || 'Unknown User' },
          timestamp: grid.upload_date,
          targetId: grid.id,
          targetType: 'grid_square',
          metadata: {
            coordinate: grid.coordinate
          }
        });
      });

      // Fetch recent screenshots with manual joins
      const { data: recentScreenshots, error: screenshotsError } = await supabase
        .from('comment_screenshots')
        .select(`
          id,
          url,
          created_at,
          uploaded_by,
          comment_id
        `)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 4));

      // Fetch additional details separately
      let screenshotsWithDetails = [];
      if (recentScreenshots && !screenshotsError) {
        for (const screenshot of recentScreenshots) {
          // Get username only if uploaded_by is not null
          let profile = null;
          if (screenshot.uploaded_by) {
            const { data } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', screenshot.uploaded_by)
              .single();
            profile = data;
          }

          // Get comment details
          const { data: comment } = await supabase
            .from('comments')
            .select(`
              poi_id,
              grid_square_id
            `)
            .eq('id', screenshot.comment_id)
            .single();

          let poiTitle = null;
          let coordinate = null;

          if (comment) {
            // Get POI title if poi_id exists
            if (comment.poi_id) {
              const { data: poi } = await supabase
                .from('pois')
                .select('title')
                .eq('id', comment.poi_id)
                .single();
              poiTitle = poi?.title;
            }

            // Get grid coordinate if grid_square_id exists
            if (comment.grid_square_id) {
              const { data: gridSquare } = await supabase
                .from('grid_squares')
                .select('coordinate')
                .eq('id', comment.grid_square_id)
                .single();
              coordinate = gridSquare?.coordinate;
            }
          }

          screenshotsWithDetails.push({
            ...screenshot,
            profiles: { username: profile?.username || 'Unknown User' },
            comments: {
              poi_id: comment?.poi_id,
              grid_square_id: comment?.grid_square_id,
              pois: poiTitle ? { title: poiTitle } : null,
              grid_squares: coordinate ? { coordinate } : null
            }
          });
        }
      }

      if (screenshotsError) throw screenshotsError;

      screenshotsWithDetails?.forEach(screenshot => {
        const target = screenshot.comments?.pois?.title || 
                      screenshot.comments?.grid_squares?.coordinate || 
                      'Unknown';
        const targetType = screenshot.comments?.poi_id ? 'poi' : 'grid_square';
        
        activities.push({
          id: `screenshot_${screenshot.id}`,
          type: 'screenshot_uploaded',
          title: 'Screenshot Uploaded',
          description: `New screenshot uploaded for ${target}`,
          user: { username: screenshot.profiles?.username || 'Unknown User' },
          timestamp: screenshot.created_at,
          targetId: screenshot.comments?.poi_id || screenshot.comments?.grid_square_id || '',
          targetType: targetType,
          metadata: {
            coordinate: screenshot.comments?.grid_squares?.coordinate,
            poiTitle: screenshot.comments?.pois?.title,
            screenshotUrl: screenshot.url
          }
        });
      });

      // Sort all activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Limit to the requested number of activities
      setActivities(activities.slice(0, limit));
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'poi_created':
        return MapPin;
      case 'comment_added':
        return MessageSquare;
      case 'grid_explored':
        return Eye;
      case 'screenshot_uploaded':
        return Camera;
      default:
        return User;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'poi_created':
        return 'text-blue-600 bg-blue-100';
      case 'comment_added':
        return 'text-green-600 bg-green-100';
      case 'grid_explored':
        return 'text-orange-600 bg-orange-100';
      case 'screenshot_uploaded':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-sand-600 bg-sand-100';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-sand-200">
        <div className="p-6 border-b border-sand-200">
          <h3 className="text-lg font-semibold text-night-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-sand-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-sand-200 rounded mb-2"></div>
                  <div className="h-3 bg-sand-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-sand-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-sand-200">
        <div className="p-6 border-b border-sand-200">
          <h3 className="text-lg font-semibold text-night-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading activities: {error}</p>
            <button
              onClick={fetchActivities}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-sand-200">
      <div className="p-6 border-b border-sand-200">
        <h3 className="text-lg font-semibold text-night-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sand-400 mb-2">
              <Clock size={48} className="mx-auto" />
            </div>
            <p className="text-sand-600">No recent activity</p>
            <p className="text-sm text-sand-500">Activity will appear here as users interact with the map</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClasses = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${colorClasses}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-night-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-sand-500">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                    <p className="text-sm text-sand-700 mb-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-sand-500">
                      <span>by {activity.user.username}</span>
                      {activity.metadata?.coordinate && (
                        <>
                          <span>•</span>
                          <span>{activity.metadata.coordinate}</span>
                        </>
                      )}
                    </div>
                    {activity.metadata?.screenshotUrl && (
                      <div className="mt-2">
                        <img
                          src={activity.metadata.screenshotUrl}
                          alt="Activity screenshot"
                          className="w-16 h-16 object-cover rounded border border-sand-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed; 