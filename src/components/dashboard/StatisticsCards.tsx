import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardStats } from '../../types';
import StatCard from './StatCard';
import { 
  MapPin, 
  MessageSquare, 
  Eye, 
  Camera, 
  Users,
  Mountain,
  Waves
} from 'lucide-react';
import { useExplorationChangeListener } from '../../lib/explorationEvents';

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
        deepDesertPoisResult,
        haggaBasinPoisResult,
        commentsResult,
        exploredGridSquaresResult,
        screenshotsResult,
        usersResult,
        collectionsResult,
        privatePoisResult,
        sharedPoisResult
      ] = await Promise.all([
        supabase.from('pois').select('id', { count: 'exact', head: true }),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('map_type', 'deep_desert'),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('map_type', 'hagga_basin'),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('grid_squares').select('id', { count: 'exact', head: true }).eq('is_explored', true),
        supabase.from('comment_screenshots').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('poi_collections').select('id', { count: 'exact', head: true }),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('privacy_level', 'private'),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('privacy_level', 'shared')
      ]);

      // Check for errors
      if (poisResult.error) throw poisResult.error;
      if (deepDesertPoisResult.error) throw deepDesertPoisResult.error;
      if (haggaBasinPoisResult.error) throw haggaBasinPoisResult.error;
      if (commentsResult.error) throw commentsResult.error;
      if (exploredGridSquaresResult.error) throw exploredGridSquaresResult.error;
      if (screenshotsResult.error) throw screenshotsResult.error;
      if (usersResult.error) throw usersResult.error;
      if (collectionsResult.error) throw collectionsResult.error;
      if (privatePoisResult.error) throw privatePoisResult.error;
      if (sharedPoisResult.error) throw sharedPoisResult.error;

      // Also count POI screenshots
      const { count: poiScreenshotsCount, error: poiScreenshotsError } = await supabase
        .from('pois')
        .select('screenshots', { count: 'exact', head: true });

      if (poiScreenshotsError) throw poiScreenshotsError;

      setStats({
        totalPois: poisResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalGridSquares: 81, // Deep Desert is 9x9 grid
        exploredGridSquares: exploredGridSquaresResult.count || 0,
        totalScreenshots: (screenshotsResult.count || 0) + (poiScreenshotsCount || 0),
        totalUsers: usersResult.count || 0,
        deepDesertPois: deepDesertPoisResult.count || 0,
        haggaBasinPois: haggaBasinPoisResult.count || 0,
        poiCollections: collectionsResult.count || 0,
        sharedPois: sharedPoisResult.count || 0,
        privatePois: privatePoisResult.count || 0
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

  // Listen for exploration status changes
  useExplorationChangeListener((details) => {
    // StatisticsCards: Received exploration change
    fetchStatistics(); // Refresh statistics when exploration status changes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
      <StatCard
        title="Deep Desert POIs"
        value={stats.deepDesertPois}
        icon={Mountain}
        subtitle="Grid-based POIs"
        color="orange"
      />
      
      <StatCard
        title="Hagga Basin POIs"
        value={stats.haggaBasinPois}
        icon={Waves}
        subtitle="Map-based POIs"
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
        subtitle={`${stats.exploredGridSquares}/81 grids`}
        color="purple"
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

      <StatCard
        title="Collections"
        value={stats.poiCollections}
        icon={MapPin}
        subtitle="POI collections"
        color="indigo"
      />
    </div>
  );
};

export default StatisticsCards; 