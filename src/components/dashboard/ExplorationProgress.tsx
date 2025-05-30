import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DiamondIcon from '../common/DiamondIcon';
import { Eye, Target, Grid3X3 } from 'lucide-react';
import { useExplorationChangeListener } from '../../lib/explorationEvents';

interface ExplorationData {
  totalGridSquares: number;
  exploredGridSquares: number;
  percentage: number;
  recentExplorations: number; // explored in last 7 days
  exploredGrids: string[]; // list of explored grid coordinates
}

const ExplorationProgress: React.FC = () => {
  const [data, setData] = useState<ExplorationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExplorationData = async () => {
    setIsLoading(true);
    try {
      const [totalResult, exploredResult, exploredListResult, recentResult] = await Promise.all([
        supabase.from('grid_squares').select('id', { count: 'exact', head: true }),
        supabase.from('grid_squares').select('id', { count: 'exact', head: true }).eq('is_explored', true),
        supabase.from('grid_squares').select('coordinate').eq('is_explored', true).order('coordinate'),
        supabase
          .from('grid_squares')
          .select('id', { count: 'exact', head: true })
          .eq('is_explored', true)
          .gte('upload_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (totalResult.error) throw totalResult.error;
      if (exploredResult.error) throw exploredResult.error;
      if (exploredListResult.error) throw exploredListResult.error;
      if (recentResult.error) throw recentResult.error;

      const total = totalResult.count || 0;
      const explored = exploredResult.count || 0;
      const recent = recentResult.count || 0;
      const percentage = total > 0 ? (explored / total) * 100 : 0;
      const exploredGrids = exploredListResult.data?.map(grid => grid.coordinate) || [];

      setData({
        totalGridSquares: total,
        exploredGridSquares: explored,
        percentage,
        recentExplorations: recent,
        exploredGrids
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
    console.log('ExplorationProgress: Received exploration change:', details);
    fetchExplorationData(); // Refresh data when exploration status changes
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <div className="h-4 bg-slate-700/40 rounded w-24"></div>
            <div className="h-4 bg-slate-700/40 rounded w-16"></div>
          </div>
          <div className="w-full bg-slate-700/40 rounded-full h-2">
            <div className="bg-slate-600/40 h-2 rounded-full w-1/3"></div>
          </div>
        </div>
        <div className="h-3 bg-slate-700/40 rounded w-3/4"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <DiamondIcon
          icon={<Grid3X3 size={12} strokeWidth={1.5} />}
          size="sm"
          bgColor="bg-void-950"
          actualBorderColor="bg-gold-300"
          borderThickness={1}
          iconColor="text-gold-300"
        />
        <h4 className="text-xs font-light tracking-widest text-amber-200 uppercase"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          Grid Exploration
        </h4>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-amber-300/80 font-light tracking-wide">Coverage</span>
          <span className="font-light text-amber-200 tracking-wide">
            {data.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-800/60 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(data.percentage, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Target size={10} className="text-amber-400" />
          <span className="text-amber-300/80 font-light">Total:</span>
          <span className="font-light text-amber-200">{data.totalGridSquares}</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={10} className="text-green-400" />
          <span className="text-amber-300/80 font-light">Found:</span>
          <span className="font-light text-amber-200">{data.exploredGridSquares}</span>
        </div>
      </div>

      {/* Recent Activity */}
      {data.recentExplorations > 0 && (
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
          
          <div className="relative text-xs text-amber-300 p-2 rounded-lg border border-amber-400/30">
            <span className="font-light tracking-wide">🔥 {data.recentExplorations} new this week</span>
          </div>
        </div>
      )}

      {/* Explored Grids List */}
      {data.exploredGrids.length > 0 && (
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
          
          <div className="relative p-3 rounded-lg border border-amber-400/20">
            <h5 className="text-xs font-light text-amber-200 mb-2 tracking-wide">Explored Squares:</h5>
            <div className="flex flex-wrap gap-1">
              {data.exploredGrids.slice(0, 8).map((grid) => (
                <span
                  key={grid}
                  className="inline-block px-2 py-1 bg-amber-400/20 text-amber-300 text-xs rounded border border-amber-400/30 font-light tracking-wide"
                >
                  {grid}
                </span>
              ))}
              {data.exploredGrids.length > 8 && (
                <span className="inline-block px-2 py-1 bg-slate-700/60 text-amber-300/80 text-xs rounded border border-slate-600/40 font-light">
                  +{data.exploredGrids.length - 8}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorationProgress; 