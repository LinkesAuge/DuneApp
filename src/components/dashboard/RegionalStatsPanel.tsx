import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import StatCard from './StatCard';
import CategoryBreakdown from './CategoryBreakdown';
import DiamondIcon from '../common/DiamondIcon';
import { MapPin, TrendingUp, Activity, Users } from 'lucide-react';
import { useExplorationChangeListener } from '../../lib/explorationEvents';

interface CategoryData {
  name: string;
  count: number;
  icon: string;
  color: string;
}

interface RegionalStatsData {
  totalPois: number;
  categoryBreakdown: CategoryData[];
  recentActivity: number;
  explorationProgress: number;
  userContributions: number;
}

interface RegionalStatsPanelProps {
  region: 'deep_desert' | 'hagga_basin';
  title: string;
  theme: 'desert' | 'basin';
}

const RegionalStatsPanel: React.FC<RegionalStatsPanelProps> = ({ 
  region, 
  title, 
  theme 
}) => {
  const [stats, setStats] = useState<RegionalStatsData>({
    totalPois: 0,
    categoryBreakdown: [],
    recentActivity: 0,
    explorationProgress: 0,
    userContributions: 0
  });
  const [loading, setLoading] = useState(true);

  const themeConfig = {
    desert: {
      primary: 'from-amber-500 to-amber-600',
      accent: 'text-amber-300',
      border: 'border-amber-400/30',
      bg: 'bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent',
      progressBar: 'from-amber-500 to-amber-400'
    },
    basin: {
      primary: 'from-blue-500 to-blue-600',
      accent: 'text-blue-300', 
      border: 'border-blue-400/30',
      bg: 'bg-gradient-to-b from-blue-600/10 via-blue-500/5 to-transparent',
      progressBar: 'from-blue-500 to-blue-400'
    }
  };

  const config = themeConfig[theme];

  const categoryIcons = {
    'Base': '🏠',
    'Resources': '⚡',
    'Locations': '🗺️',
    'NPCs': '👤',
    'Custom': '⭐'
  };

  useEffect(() => {
    fetchRegionalStats();
  }, [region]);

  // Listen for exploration status changes
  useExplorationChangeListener((details) => {
    // RegionalStatsPanel: Received exploration change
    fetchRegionalStats(); // Refresh regional statistics when exploration status changes
  });

  const fetchRegionalStats = async () => {
    try {
      setLoading(true);

      // Get total POIs for this region
      const { data: poisData, error: poisError } = await supabase
        .from('pois')
        .select('id, poi_type_id')
        .eq('map_type', region);

      if (poisError) throw poisError;

      const totalPois = poisData?.length || 0;

      // Get POI types with categories for breakdown
      const { data: poiTypesData, error: poiTypesError } = await supabase
        .from('poi_types')
        .select('id, name, category, icon');

      if (poiTypesError) throw poiTypesError;

      // Calculate category breakdown
      const categoryCount: Record<string, number> = {};
      poisData?.forEach(poi => {
        const poiType = poiTypesData?.find(type => type.id === poi.poi_type_id);
        if (poiType) {
          const category = poiType.category || 'Other';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });

      const categoryBreakdown: CategoryData[] = Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count,
        icon: categoryIcons[name as keyof typeof categoryIcons] || '📍',
        color: config.accent
      }));

      // Get recent activity (POIs added in last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: recentData, error: recentError } = await supabase
        .from('pois')
        .select('id')
        .eq('map_type', region)
        .gte('created_at', weekAgo.toISOString());

      if (recentError) throw recentError;

      const recentActivity = recentData?.length || 0;

      // Calculate exploration progress (only for Deep Desert)
      let explorationProgress = 0;
      if (region === 'deep_desert') {
        try {
          // Get total grid squares and explored grid squares
          const [totalGridResult, exploredGridResult] = await Promise.all([
            supabase.from('grid_squares').select('id', { count: 'exact', head: true }),
            supabase.from('grid_squares').select('id', { count: 'exact', head: true }).eq('is_explored', true)
          ]);

          if (!totalGridResult.error && !exploredGridResult.error) {
            const totalGrids = totalGridResult.count || 0;
            const exploredGrids = exploredGridResult.count || 0;
            explorationProgress = totalGrids > 0 ? (exploredGrids / totalGrids) * 100 : 0;
          }
        } catch (error) {
          console.error('Error calculating exploration progress:', error);
          explorationProgress = 0;
        }
      }

      // Get user contributions count
      const { data: contributorsData, error: contributorsError } = await supabase
        .from('pois')
        .select('created_by')
        .eq('map_type', region);

      if (contributorsError) throw contributorsError;

      const uniqueContributors = new Set(contributorsData?.map(p => p.created_by).filter(Boolean));
      const userContributions = uniqueContributors.size;

      setStats({
        totalPois,
        categoryBreakdown,
        recentActivity,
        explorationProgress,
        userContributions
      });

    } catch (error) {
      console.error('Error fetching regional stats:', error);
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
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-700/40 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700/40 rounded"></div>
              <div className="h-4 bg-slate-700/40 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            icon={<MapPin size={16} strokeWidth={1.5} />}
            size="sm"
            bgColor="bg-void-950"
            actualBorderColor="bg-gold-300"
            borderThickness={1}
            iconColor="text-gold-300"
          />
          <h3 className={`text-base font-light tracking-widest ${config.accent} uppercase`}
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {title}
          </h3>
        </div>

        {/* Main Stats - 3 Column Layout for both regions */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Total POIs */}
          <StatCard
            title="Total POIs"
            value={stats.totalPois}
            subtitle={`${stats.recentActivity} added this week`}
            trend={stats.recentActivity > 0 ? { direction: 'up', value: `+${stats.recentActivity}` } : undefined}
            color={theme === 'desert' ? 'orange' : 'blue'}
            icon={MapPin}
          />
          
          {/* Middle column - Exploration for Desert, Recent Activity for Basin */}
          {region === 'deep_desert' ? (
            <StatCard
              title="Exploration"
              value={Math.round(stats.explorationProgress)}
              subtitle={`${Math.round(stats.explorationProgress)}% complete`}
              color={theme === 'desert' ? 'orange' : 'blue'}
              icon={Activity}
            />
          ) : (
            <StatCard
              title="Recent POIs"
              value={stats.recentActivity}
              subtitle="Added this week"
              color={theme === 'desert' ? 'orange' : 'blue'}
              icon={Activity}
            />
          )}
          
          {/* Contributors */}
          <StatCard
            title="Contributors"
            value={stats.userContributions}
            subtitle="Active users"
            color={theme === 'desert' ? 'orange' : 'blue'}
            icon={Users}
          />
        </div>

        {/* Category Breakdown */}
        <CategoryBreakdown
          categories={stats.categoryBreakdown}
          total={stats.totalPois}
          title="POI Categories"
          theme={theme}
        />

        {/* Recent Activity Indicator */}
        {stats.recentActivity > 0 && (
          <div className="mt-4 group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-green-600/10 via-green-500/5 to-transparent rounded-lg" />
            
            <div className="relative flex items-center gap-2 text-xs text-green-300 p-2 rounded-lg border border-green-400/30">
              <Activity size={12} className="text-green-400" />
              <span className="font-light tracking-wide">{stats.recentActivity} new POIs added this week</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalStatsPanel; 