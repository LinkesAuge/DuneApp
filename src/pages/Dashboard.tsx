import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import StatisticsCards from '../components/dashboard/StatisticsCards';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ExplorationProgress from '../components/dashboard/ExplorationProgress';
import CommunityStats from '../components/dashboard/CommunityStats';
import { BarChart3, Activity, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-spice-500 to-spice-600 rounded-lg">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-night-900">
                Dashboard
              </h1>
              <p className="text-sand-600">
                Welcome back{user ? `, ${user.user_metadata?.username || 'Explorer'}` : ''}! 
                Here's what's happening across the Deep Desert and Hagga Basin regions.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-spice-600" />
            <h2 className="text-xl font-semibold text-night-900">Statistics Overview</h2>
          </div>
          <StatisticsCards />
        </div>

        {/* Activity Feed and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={20} className="text-spice-600" />
              <h2 className="text-xl font-semibold text-night-900">Recent Activity</h2>
            </div>
            <ActivityFeed limit={15} />
          </div>

          {/* Quick Info Panel */}
          <div className="space-y-6">
            {/* Exploration Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-6">
              <h3 className="text-lg font-semibold text-night-900 mb-4">Exploration Progress</h3>
              <ExplorationProgress />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-6">
              <h3 className="text-lg font-semibold text-night-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/deep-desert"
                  className="flex items-center justify-between p-3 bg-sand-50 rounded-lg hover:bg-sand-100 transition-colors"
                >
                  <span className="text-sm font-medium text-night-800">Deep Desert Grid</span>
                  <span className="text-xs text-sand-500">→</span>
                </Link>
                <Link
                  to="/hagga-basin"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-sm font-medium text-night-800">Hagga Basin Map</span>
                  <span className="text-xs text-blue-500">→</span>
                </Link>
                <Link
                  to="/pois"
                  className="flex items-center justify-between p-3 bg-sand-50 rounded-lg hover:bg-sand-100 transition-colors"
                >
                  <span className="text-sm font-medium text-night-800">Browse All POIs</span>
                  <span className="text-xs text-sand-500">→</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between p-3 bg-spice-50 rounded-lg hover:bg-spice-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-spice-800">Admin Panel</span>
                    <span className="text-xs text-spice-500">→</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-6">
              <h3 className="text-lg font-semibold text-night-900 mb-4">Community</h3>
              <CommunityStats />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-sand-500">
            Dune Awakening Tracker • Deep Desert & Hagga Basin • Community-driven exploration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 