import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import StatCard from './StatCard';
import CategoryBreakdown from './CategoryBreakdown';
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
      primary: 'from-orange-500 to-orange-600',
      secondary: 'text-orange-600',
      background: 'bg-orange-50',
      border: 'border-orange-200'
    },
    basin: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'text-blue-600', 
      background: 'bg-blue-50',
      border: 'border-blue-200'
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
        color: config.secondary
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
      <div className={`${config.background} ${config.border} border rounded-lg p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-sand-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-sand-200 rounded"></div>
            <div className="h-4 bg-sand-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${config.background} ${config.border} border rounded-lg p-4`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-1.5 bg-gradient-to-r ${config.primary} rounded-lg`}>
          <MapPin size={16} className="text-white" />
        </div>
        <h3 className={`text-base font-semibold ${config.secondary}`}>
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
          <div className="text-center p-2 bg-white rounded-lg border border-sand-100 flex flex-col justify-center">
            <div className={`text-lg font-bold ${config.secondary}`}>
              {Math.round(stats.explorationProgress)}%
            </div>
            <div className="text-xs text-sand-600 mb-1">Exploration</div>
            <div className="h-1 bg-sand-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${theme === 'desert' ? 'bg-orange-500' : 'bg-blue-500'} transition-all duration-500`}
                style={{ width: `${stats.explorationProgress}%` }}
              />
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
        <div className="mt-4 flex items-center gap-2 text-xs text-sand-600 bg-white rounded-lg p-2">
          <Activity size={12} className="text-green-500" />
          <span>{stats.recentActivity} new POIs added this week</span>
        </div>
      )}
    </div>
  );
};

export default RegionalStatsPanel; 