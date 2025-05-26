import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, TrendingUp, Calendar } from 'lucide-react';

interface CommunityData {
  activeUsers: number; // users who were active in last 30 days
  todaysActivity: number; // activities today
  weeklyActivity: number; // activities this week
}

const CommunityStats: React.FC = () => {
  const [data, setData] = useState<CommunityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunityData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Count activities today (POIs + Comments)
      const [poisTodayResult, commentsTodayResult] = await Promise.all([
        supabase
          .from('pois')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
      ]);

      // Count activities this week
      const [poisWeekResult, commentsWeekResult] = await Promise.all([
        supabase
          .from('pois')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString())
      ]);

      // Count active users (those who created POIs or comments in last 30 days)
      const [activePoisUsersResult, activeCommentsUsersResult] = await Promise.all([
        supabase
          .from('pois')
          .select('created_by', { count: 'exact' })
          .gte('created_at', monthAgo.toISOString()),
        supabase
          .from('comments')
          .select('created_by', { count: 'exact' })
          .gte('created_at', monthAgo.toISOString())
      ]);

      // Get unique active users
      const poisUsers = new Set(activePoisUsersResult.data?.map(p => p.created_by) || []);
      const commentsUsers = new Set(activeCommentsUsersResult.data?.map(c => c.created_by) || []);
      const allActiveUsers = new Set([...poisUsers, ...commentsUsers]);

      const todaysActivity = (poisTodayResult.count || 0) + (commentsTodayResult.count || 0);
      const weeklyActivity = (poisWeekResult.count || 0) + (commentsWeekResult.count || 0);

      setData({
        activeUsers: allActiveUsers.size,
        todaysActivity,
        weeklyActivity
      });

    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-sand-200 rounded w-20"></div>
          <div className="h-4 bg-sand-200 rounded w-12"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-sand-200 rounded w-24"></div>
          <div className="h-4 bg-sand-200 rounded w-8"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-sand-200 rounded w-16"></div>
          <div className="h-4 bg-sand-200 rounded w-10"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-blue-600" />
          <span className="text-sm text-sand-600">Active Users</span>
        </div>
        <span className="text-sm font-medium text-night-900">{data.activeUsers}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-green-600" />
          <span className="text-sm text-sand-600">Today's Activity</span>
        </div>
        <span className="text-sm font-medium text-night-900">{data.todaysActivity}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-purple-600" />
          <span className="text-sm text-sand-600">This Week</span>
        </div>
        <span className="text-sm font-medium text-night-900">{data.weeklyActivity}</span>
      </div>

      {data.todaysActivity > 0 && (
        <div className="text-xs text-sand-500 bg-green-50 p-2 rounded border border-green-200">
          🎉 Active community today!
        </div>
      )}
    </div>
  );
};

export default CommunityStats; 