import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, Target } from 'lucide-react';

interface ExplorationData {
  totalGridSquares: number;
  exploredGridSquares: number;
  percentage: number;
  recentExplorations: number; // explored in last 7 days
}

const ExplorationProgress: React.FC = () => {
  const [data, setData] = useState<ExplorationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExplorationData = async () => {
    setIsLoading(true);
    try {
      const [totalResult, exploredResult, recentResult] = await Promise.all([
        supabase.from('grid_squares').select('id', { count: 'exact', head: true }),
        supabase.from('grid_squares').select('id', { count: 'exact', head: true }).eq('is_explored', true),
        supabase
          .from('grid_squares')
          .select('id', { count: 'exact', head: true })
          .eq('is_explored', true)
          .gte('upload_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (totalResult.error) throw totalResult.error;
      if (exploredResult.error) throw exploredResult.error;
      if (recentResult.error) throw recentResult.error;

      const total = totalResult.count || 0;
      const explored = exploredResult.count || 0;
      const recent = recentResult.count || 0;
      const percentage = total > 0 ? (explored / total) * 100 : 0;

      setData({
        totalGridSquares: total,
        exploredGridSquares: explored,
        percentage,
        recentExplorations: recent
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
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-sand-600">Map Coverage</span>
          <span className="font-medium text-night-900">
            {data.percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-sand-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-spice-500 to-spice-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(data.percentage, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-spice-600" />
          <span className="text-sand-600">Total:</span>
          <span className="font-medium text-night-900">{data.totalGridSquares}</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-green-600" />
          <span className="text-sand-600">Explored:</span>
          <span className="font-medium text-night-900">{data.exploredGridSquares}</span>
        </div>
      </div>

      {data.recentExplorations > 0 && (
        <div className="text-xs text-sand-500 bg-sand-50 p-2 rounded">
          🔥 {data.recentExplorations} new exploration{data.recentExplorations !== 1 ? 's' : ''} this week
        </div>
      )}
      
      <div className="text-xs text-sand-500">
        Progress updates as grid squares are marked as explored
      </div>
    </div>
  );
};

export default ExplorationProgress; 