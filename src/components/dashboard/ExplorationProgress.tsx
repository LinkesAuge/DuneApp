import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import DiamondIcon from '../common/DiamondIcon';
import { Eye, Target, Grid3X3, Mountain, ArrowRight, Compass, Map } from 'lucide-react';
import { useExplorationChangeListener } from '../../lib/explorationEvents';

interface ExplorationData {
  totalGridSquares: number;
  exploredGridSquares: number;
  percentage: number;
  recentExplorations: number;
  exploredGrids: string[];
  haggaBasinPois: number;
}

const ExplorationProgress: React.FC = () => {
  const [data, setData] = useState<ExplorationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExplorationData = async () => {
    setIsLoading(true);
    try {
      // Simplified parallel queries to avoid database issues
      const [totalResult, exploredResult, exploredListResult, haggaBasinResult] = await Promise.all([
        supabase.from('grid_squares').select('id', { count: 'exact', head: true }),
        supabase.from('grid_squares').select('id', { count: 'exact', head: true }).eq('is_explored', true),
        supabase.from('grid_squares').select('coordinate').eq('is_explored', true).order('coordinate'),
        supabase.from('pois').select('id', { count: 'exact', head: true }).eq('map_type', 'hagga_basin')
      ]);

      if (totalResult.error) throw totalResult.error;
      if (exploredResult.error) throw exploredResult.error;
      if (exploredListResult.error) throw exploredListResult.error;
      if (haggaBasinResult.error) throw haggaBasinResult.error;

      const total = totalResult.count || 0;
      const explored = exploredResult.count || 0;
      const percentage = total > 0 ? (explored / total) * 100 : 0;
      const exploredGrids = exploredListResult.data?.map(grid => grid.coordinate) || [];
      const haggaBasinPois = haggaBasinResult.count || 0;

      // For recent explorations, we'll use a simpler approach to avoid date/column issues
      let recent = 0;
      try {
        const recentResult = await supabase
          .from('grid_squares')
          .select('id', { count: 'exact', head: true })
          .eq('is_explored', true)
          .gte('upload_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        if (!recentResult.error) {
          recent = recentResult.count || 0;
        }
      } catch (error) {
        // Could not fetch recent explorations, using 0
        recent = 0;
      }

      setData({
        totalGridSquares: total,
        exploredGridSquares: explored,
        percentage,
        recentExplorations: recent,
        exploredGrids,
        haggaBasinPois
      });
    } catch (error) {
      console.error('Error fetching exploration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorationData();
  }, []);

  // Listen for exploration status changes
  useExplorationChangeListener((details) => {
    // ExplorationProgress: Received exploration change
    fetchExplorationData();
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="relative p-4 rounded-lg border border-amber-400/10">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-amber-400/10 rounded w-3/4" />
                <div className="h-2 bg-amber-400/10 rounded" />
                <div className="h-3 bg-amber-400/10 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="relative p-6 rounded-lg border border-red-400/20 text-center">
          <p className="text-red-300/80 font-light tracking-wide">Failed to load exploration data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deep Desert Progress */}
      <div className="group relative">
        {/* Multi-layer background system */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        
        {/* Interactive purple overlay */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-r from-violet-600/5 via-violet-700/3 to-transparent" />
        
        {/* Content */}
        <div className="relative p-4 rounded-lg border border-amber-400/10 hover:border-amber-300/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <DiamondIcon
                icon={<Grid3X3 size={16} strokeWidth={1.5} />}
                size="sm"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={1}
                iconColor="text-gold-300"
              />
              <div>
                <h3 
                  className="font-light text-amber-200 tracking-wide text-sm"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  Deep Desert Grid
                </h3>
                <p className="text-xs font-thin text-amber-300/60">
                  {data.exploredGridSquares} of {data.totalGridSquares} sectors explored
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span 
                className="text-lg font-light text-amber-200 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {Math.round(data.percentage)}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-800/50 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(data.percentage, 100)}%` }}
            />
          </div>
          
          {/* Action Button */}
          <Link 
            to="/deep-desert"
            className="inline-flex items-center gap-2 text-xs font-light text-amber-300/80 hover:text-amber-200 transition-colors duration-200"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            <Eye size={12} strokeWidth={1.5} />
            Explore Grid
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Hagga Basin Progress */}
      <div className="group relative">
        {/* Multi-layer background system */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        
        {/* Interactive purple overlay */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-r from-violet-600/5 via-violet-700/3 to-transparent" />
        
        {/* Content */}
        <div className="relative p-4 rounded-lg border border-amber-400/10 hover:border-amber-300/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <DiamondIcon
                icon={<Mountain size={16} strokeWidth={1.5} />}
                size="sm"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={1}
                iconColor="text-gold-300"
              />
              <div>
                <h3 
                  className="font-light text-amber-200 tracking-wide text-sm"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  Hagga Basin Map
                </h3>
                <p className="text-xs font-thin text-amber-300/60">
                  {data.haggaBasinPois} POIs discovered
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span 
                className="text-lg font-light text-amber-200 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {data.haggaBasinPois}
              </span>
            </div>
          </div>
          
          {/* Progress Indicator - shows full bar since there's no defined limit for POIs */}
          <div className="w-full bg-slate-800/50 rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500 ease-out w-full" />
          </div>
          
          {/* Action Button */}
          <Link 
            to="/hagga-basin"
            className="inline-flex items-center gap-2 text-xs font-light text-amber-300/80 hover:text-amber-200 transition-colors duration-200"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            <Map size={12} strokeWidth={1.5} />
            Explore Map
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Combined Exploration Status */}
      <div className="group relative">
        {/* Multi-layer background system */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        
        {/* Interactive purple overlay */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-r from-violet-600/5 via-violet-700/3 to-transparent" />
        
        {/* Content */}
        <div className="relative p-4 rounded-lg border border-amber-400/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DiamondIcon
                icon={<Compass size={16} strokeWidth={1.5} />}
                size="sm"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={1}
                iconColor="text-gold-300"
              />
              <div>
                <h3 
                  className="font-light text-amber-200 tracking-wide text-sm"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  Overall Progress
                </h3>
                <p className="text-xs font-thin text-amber-300/60">
                  Expedition advancement across all regions
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span 
                className="text-lg font-light text-amber-200 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {Math.round(data.percentage)}%
              </span>
            </div>
          </div>
          
          {/* Recent Activity Indicator */}
          {data.recentExplorations > 0 && (
            <div className="mt-3 pt-3 border-t border-amber-400/10">
              <span className="text-xs font-light text-amber-300/70">
                🔥 {data.recentExplorations} new this week
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorationProgress; 