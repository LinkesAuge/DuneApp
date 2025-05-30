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
    console.log('RegionalStatsPanel: Received exploration change:', details);
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
        // For grid system, could calculate based on explored squares
        explorationProgress = Math.min((totalPois / 1000) * 100, 100);
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
        {/* Multi-layer background system */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        
        <div className="relative p-4 rounded-lg border border-amber-400/20">
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
      {/* Multi-layer background system */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
      <div className={`absolute inset-0 ${config.bg} rounded-lg`} />
      
      {/* Interactive purple overlay */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
      
      <div className={`relative p-4 rounded-lg border ${config.border} hover:border-amber-300/30 transition-all duration-300`}>
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
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
              
              <div className="relative p-2 rounded-lg border border-amber-400/20 flex flex-col justify-center text-center">
                <div className="text-lg font-light text-amber-200 tracking-wide">
                  {Math.round(stats.explorationProgress)}%
                </div>
                <div className="text-xs text-amber-300/80 mb-1 font-light tracking-wide">Exploration</div>
                <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${config.progressBar} transition-all duration-500`}
                    style={{ width: `${stats.explorationProgress}%` }}
                  />
                </div>
              </div>
            </div>
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