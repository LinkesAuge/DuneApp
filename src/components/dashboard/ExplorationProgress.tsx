import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, Target, Grid3X3 } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <div className="h-4 bg-sand-200 rounded w-24"></div>
            <div className="h-4 bg-sand-200 rounded w-16"></div>
          </div>
          <div className="w-full bg-sand-200 rounded-full h-2">
            <div className="bg-sand-300 h-2 rounded-full w-1/3"></div>
          </div>
        </div>
        <div className="h-3 bg-sand-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <Grid3X3 size={12} className="text-orange-600" />
        <h4 className="text-xs font-semibold text-orange-600">Grid Exploration</h4>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-sand-600">Coverage</span>
          <span className="font-medium text-night-900">
            {data.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-orange-100 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(data.percentage, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Target size={10} className="text-orange-600" />
          <span className="text-sand-600">Total:</span>
          <span className="font-medium text-night-900">{data.totalGridSquares}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye size={10} className="text-green-600" />
          <span className="text-sand-600">Found:</span>
          <span className="font-medium text-night-900">{data.exploredGridSquares}</span>
        </div>
      </div>

      {/* Recent Activity */}
      {data.recentExplorations > 0 && (
        <div className="text-xs text-orange-700 bg-orange-50 p-1.5 rounded border border-orange-200">
          🔥 {data.recentExplorations} new this week
        </div>
      )}

      {/* Explored Grids List */}
      {data.exploredGrids.length > 0 && (
        <div className="bg-sand-50 rounded-lg p-2 border border-sand-200">
          <h5 className="text-xs font-medium text-sand-700 mb-1">Explored Squares:</h5>
          <div className="flex flex-wrap gap-0.5">
            {data.exploredGrids.slice(0, 8).map((grid) => (
              <span
                key={grid}
                className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded border border-orange-200"
              >
                {grid}
              </span>
            ))}
            {data.exploredGrids.length > 8 && (
              <span className="inline-block px-1.5 py-0.5 bg-sand-100 text-sand-600 text-xs rounded border border-sand-200">
                +{data.exploredGrids.length - 8}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorationProgress; 