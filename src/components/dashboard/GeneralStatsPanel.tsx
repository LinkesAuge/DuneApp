import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import StatCard from './StatCard';
import { Users, MessageSquare, Camera, TrendingUp, Activity, BarChart3, MapPin } from 'lucide-react';

interface GeneralStatsData {
  totalUsers: number;
  totalComments: number;
  totalScreenshots: number;
  totalCollections: number;
  weeklyGrowth: {
    newUsers: number;
    newPois: number;
    newComments: number;
  };
  regionComparison: {
    deepDesert: number;
    haggaBasin: number;
  };
}

const GeneralStatsPanel: React.FC = () => {
  const [stats, setStats] = useState<GeneralStatsData>({
    totalUsers: 0,
    totalComments: 0,
    totalScreenshots: 0,
    totalCollections: 0,
    weeklyGrowth: {
      newUsers: 0,
      newPois: 0,
      newComments: 0,
    },
    regionComparison: {
      deepDesert: 0,
      haggaBasin: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeneralStats();
  }, []);

  const fetchGeneralStats = async () => {
    try {
      setLoading(true);

      // Get week ago date
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoISO = weekAgo.toISOString();

      // Fetch all stats in parallel
      const [
        usersResult,
        commentsResult,
        screenshotsResult,
        collectionsResult,
        newUsersResult,
        newPoisResult,
        newCommentsResult,
        deepDesertPoisResult,
        haggaBasinPoisResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('comment_screenshots').select('id', { count: 'exact', head: true }),
        supabase.from('poi_collections').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', weekAgoISO),
        supabase.from('pois').select('id', { count: 'exact', head: true }).gte('created_at', weekAgoISO),
        supabase.from('comments').select('id', { count: 'exact', head: true }).gte('created_at', weekAgoISO),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('map_type', 'deep_desert'),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('map_type', 'hagga_basin'),
      ]);

      // Check for errors
      const results = [
        usersResult, commentsResult, screenshotsResult, collectionsResult,
        newUsersResult, newPoisResult, newCommentsResult,
        deepDesertPoisResult, haggaBasinPoisResult
      ];

      for (const result of results) {
        if (result.error) throw result.error;
      }

      // Count POI screenshots separately
      const { count: poiScreenshotsCount, error: poiScreenshotsError } = await supabase
        .from('pois')
        .select('screenshots', { count: 'exact', head: true });

      if (poiScreenshotsError) throw poiScreenshotsError;

      setStats({
        totalUsers: usersResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalScreenshots: (screenshotsResult.count || 0) + (poiScreenshotsCount || 0),
        totalCollections: collectionsResult.count || 0,
        weeklyGrowth: {
          newUsers: newUsersResult.count || 0,
          newPois: newPoisResult.count || 0,
          newComments: newCommentsResult.count || 0,
        },
        regionComparison: {
          deepDesert: deepDesertPoisResult.count || 0,
          haggaBasin: haggaBasinPoisResult.count || 0,
        },
      });

    } catch (error) {
      console.error('Error fetching general stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-sand-200 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-sand-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-sand-200 rounded"></div>
            <div className="h-4 bg-sand-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalPois = stats.regionComparison.deepDesert + stats.regionComparison.haggaBasin;
  const deepDesertPercentage = totalPois > 0 ? (stats.regionComparison.deepDesert / totalPois) * 100 : 50;
  const haggaBasinPercentage = totalPois > 0 ? (stats.regionComparison.haggaBasin / totalPois) * 100 : 50;

  return (
    <div className="bg-white border border-sand-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gradient-to-r from-spice-500 to-spice-600 rounded-lg">
          <BarChart3 size={16} className="text-white" />
        </div>
        <h3 className="text-base font-semibold text-spice-600">
          Community Overview
        </h3>
      </div>

      {/* Main Community Stats - 5 Column Layout */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`+${stats.weeklyGrowth.newUsers} this week`}
          icon={Users}
          color="green"
          trend={stats.weeklyGrowth.newUsers > 0 ? { direction: 'up', value: `+${stats.weeklyGrowth.newUsers}` } : undefined}
        />
        
        <StatCard
          title="Comments"
          value={stats.totalComments}
          subtitle={`+${stats.weeklyGrowth.newComments} this week`}
          icon={MessageSquare}
          color="blue"
        />
        
        <StatCard
          title="Screenshots"
          value={stats.totalScreenshots}
          subtitle="Images shared"
          icon={Camera}
          color="purple"
        />

        <StatCard
          title="Total POIs"
          value={totalPois}
          subtitle={`+${stats.weeklyGrowth.newPois} this week`}
          icon={MapPin}
          color="orange"
          trend={stats.weeklyGrowth.newPois > 0 ? { direction: 'up', value: `+${stats.weeklyGrowth.newPois}` } : undefined}
        />

        <StatCard
          title="Collections"
          value={stats.totalCollections}
          subtitle="POI collections"
          icon={BarChart3}
          color="indigo"
        />
      </div>

      {/* Bottom section - Compact Regional Breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {/* Deep Desert Distribution */}
        <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-orange-700 flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Deep Desert
            </h4>
            <span className="text-sm font-bold text-orange-600">
              {stats.regionComparison.deepDesert}
            </span>
          </div>
          <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${deepDesertPercentage}%` }}
            />
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {deepDesertPercentage.toFixed(0)}% of all POIs
          </div>
        </div>

        {/* Hagga Basin Distribution */}
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Hagga Basin
            </h4>
            <span className="text-sm font-bold text-blue-600">
              {stats.regionComparison.haggaBasin}
            </span>
          </div>
          <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${haggaBasinPercentage}%` }}
            />
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {haggaBasinPercentage.toFixed(0)}% of all POIs
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralStatsPanel; 