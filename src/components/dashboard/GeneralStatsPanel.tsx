import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import StatCard from './StatCard';
import DiamondIcon from '../common/DiamondIcon';
import { Users, MessageSquare, Camera, TrendingUp, Activity, BarChart3, MapPin } from 'lucide-react';

interface GeneralStatsData {
  totalUsers: number;
  totalComments: number;
  totalScreenshots: number;

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
        managedImagesResult,

        newUsersResult,
        newPoisResult,
        newCommentsResult,
        deepDesertPoisResult,
        haggaBasinPoisResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('managed_images').select('id', { count: 'exact', head: true }),

        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', weekAgoISO),
        supabase.from('pois').select('id', { count: 'exact', head: true }).gte('created_at', weekAgoISO),
        supabase.from('comments').select('id', { count: 'exact', head: true }).gte('created_at', weekAgoISO),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('map_type', 'deep_desert'),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('map_type', 'hagga_basin'),
      ]);

      // Check for errors
      const results = [
        usersResult, commentsResult, managedImagesResult,
        newUsersResult, newPoisResult, newCommentsResult,
        deepDesertPoisResult, haggaBasinPoisResult
      ];

      for (const result of results) {
        if (result.error) throw result.error;
      }

      setStats({
        totalUsers: usersResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalScreenshots: managedImagesResult.count || 0,
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
      <div className="group relative">
        {/* Golden border */}
        <div className="absolute inset-0 bg-amber-400/60 rounded-lg" />
        
        {/* Dark purple-tinted background */}
        <div 
          className="absolute inset-0.5 rounded-lg"
          style={{ backgroundColor: 'rgb(8, 12, 20)' }}
        />
        
        <div className="relative p-4 rounded-lg">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-slate-700/40 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700/40 rounded"></div>
              <div className="h-4 bg-slate-700/40 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPois = stats.regionComparison.deepDesert + stats.regionComparison.haggaBasin;
  const deepDesertPercentage = totalPois > 0 ? (stats.regionComparison.deepDesert / totalPois) * 100 : 50;
  const haggaBasinPercentage = totalPois > 0 ? (stats.regionComparison.haggaBasin / totalPois) * 100 : 50;

  return (
    <div className="group relative">
      {/* Golden border */}
      <div className="absolute inset-0 bg-amber-400/60 group-hover:bg-amber-300/70 transition-all duration-300 rounded-lg" />
      
      {/* Dark purple-tinted background */}
      <div 
        className="absolute inset-0.5 rounded-lg"
        style={{ backgroundColor: 'rgb(8, 12, 20)' }}
      />
      
      {/* Very subtle sandy gradient overlay */}
      <div 
        className="absolute inset-0.5 rounded-lg"
        style={{
          background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(194, 154, 108, 0.02) 50%, rgba(0, 0, 0, 0) 100%)'
        }}
      />
      
      {/* Interactive purple overlay */}
      <div className="absolute inset-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
           style={{
             background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.06) 0%, rgba(124, 58, 237, 0.03) 70%, transparent 100%)'
           }} />
      
      <div className="relative p-4 rounded-lg transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <DiamondIcon
            icon={<BarChart3 size={16} strokeWidth={1.5} />}
            size="sm"
            bgColor="bg-void-950"
            actualBorderColor="bg-gold-300"
            borderThickness={1}
            iconColor="text-gold-300"
          />
          <h3 className="text-base font-light tracking-widest text-amber-200 uppercase"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Community Overview
          </h3>
        </div>

        {/* Main Community Stats - 4 Column Layout */}
        <div className="grid grid-cols-4 gap-2 mb-4">
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
        </div>

        {/* Bottom section - Compact Regional Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {/* Deep Desert Distribution */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
            
            <div className="relative p-3 rounded-lg border border-amber-400/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-light tracking-wide text-amber-200 flex items-center gap-2"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  Deep Desert
                </h4>
                <span className="text-sm font-light text-amber-300 tracking-wide">
                  {stats.regionComparison.deepDesert}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${deepDesertPercentage}%` }}
                />
              </div>
              <div className="text-xs text-amber-300/80 mt-1">
                {deepDesertPercentage.toFixed(0)}% of all POIs
              </div>
            </div>
          </div>

          {/* Hagga Basin Distribution */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-blue-500/5 to-transparent rounded-lg" />
            
            <div className="relative p-3 rounded-lg border border-blue-400/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-light tracking-wide text-blue-200 flex items-center gap-2"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Hagga Basin
                </h4>
                <span className="text-sm font-light text-blue-300 tracking-wide">
                  {stats.regionComparison.haggaBasin}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${haggaBasinPercentage}%` }}
                />
              </div>
              <div className="text-xs text-blue-300/80 mt-1">
                {haggaBasinPercentage.toFixed(0)}% of all POIs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralStatsPanel; 