import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardStats } from '../../types';
import StatCard from './StatCard';
import { 
  MapPin, 
  MessageSquare, 
  Eye, 
  Camera, 
  Users 
} from 'lucide-react';

const StatisticsCards: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all statistics in parallel
      const [
        poisResult,
        commentsResult,
        exploredGridSquaresResult,
        screenshotsResult,
        usersResult
      ] = await Promise.all([
        supabase.from('pois').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('grid_squares').select('id', { count: 'exact', head: true }).eq('is_explored', true),
        supabase.from('comment_screenshots').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      // Check for errors
      if (poisResult.error) throw poisResult.error;
      if (commentsResult.error) throw commentsResult.error;
      if (exploredGridSquaresResult.error) throw exploredGridSquaresResult.error;
      if (screenshotsResult.error) throw screenshotsResult.error;
      if (usersResult.error) throw usersResult.error;

      // Also count POI screenshots
      const { count: poiScreenshotsCount, error: poiScreenshotsError } = await supabase
        .from('pois')
        .select('screenshots', { count: 'exact', head: true });

      if (poiScreenshotsError) throw poiScreenshotsError;

      setStats({
        totalPois: poisResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalGridSquares: 0, // Not needed anymore, but keeping for type compatibility
        exploredGridSquares: exploredGridSquaresResult.count || 0,
        totalScreenshots: (screenshotsResult.count || 0) + (poiScreenshotsCount || 0),
        totalUsers: usersResult.count || 0
      });
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-sand-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-sand-200 rounded mb-2"></div>
                <div className="h-8 bg-sand-200 rounded mb-2"></div>
                <div className="h-3 bg-sand-200 rounded w-20"></div>
              </div>
              <div className="w-12 h-12 bg-sand-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading statistics: {error}</p>
        <button
          onClick={fetchStatistics}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard
        title="Total POIs"
        value={stats.totalPois}
        icon={MapPin}
        subtitle="Points of Interest"
        color="blue"
      />
      
      <StatCard
        title="Comments"
        value={stats.totalComments}
        icon={MessageSquare}
        subtitle="User discussions"
        color="green"
      />
      
      <StatCard
        title="Explored Areas"
        value={stats.exploredGridSquares}
        icon={Eye}
        subtitle="Grid squares mapped"
        color="orange"
      />
      
      <StatCard
        title="Screenshots"
        value={stats.totalScreenshots}
        icon={Camera}
        subtitle="Images uploaded"
        color="red"
      />
      
      <StatCard
        title="Users"
        value={stats.totalUsers}
        icon={Users}
        subtitle="Community members"
        color="green"
      />
    </div>
  );
};

export default StatisticsCards; 