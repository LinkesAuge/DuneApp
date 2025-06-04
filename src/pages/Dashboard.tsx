import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import EnhancedStatisticsCards from '../components/dashboard/EnhancedStatisticsCards';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ExplorationProgress from '../components/dashboard/ExplorationProgress';
import CommunityStats from '../components/dashboard/CommunityStats';
import DiamondIcon from '../components/common/DiamondIcon';
import { BarChart3, Activity, TrendingUp, Map, Users, Settings, Eye } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const QuickActionCard: React.FC<{
    to: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
  }> = ({ to, title, description, icon, gradient }) => (
    <Link to={to} className="group relative block">
      {/* Solid golden border */}
      <div className="absolute inset-0 bg-amber-400 group-hover:bg-amber-300 transition-all duration-300 rounded-lg" />
      
             {/* Dark purple-tinted background */}
       <div 
         className="absolute inset-0.5 rounded-lg"
         style={{ backgroundColor: 'rgb(8, 12, 20)' }}
       />
       
       {/* Subtle gradient shine effect */}
       <div className="absolute inset-0.5 bg-gradient-to-b from-slate-700/20 via-transparent to-slate-950/40 rounded-lg" />
       
       {/* Linear gradient from center to sides - darker overall */}
       <div 
         className="absolute inset-0.5 rounded-lg"
         style={{
           background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(51, 65, 85, 0.4) 50%, rgba(15, 23, 42, 0.8) 100%)'
         }}
       />
      
      {/* Content */}
      <div className="relative p-4 rounded-lg transition-all duration-300">
        <div className="flex items-center gap-3">
          <DiamondIcon
            icon={icon}
            size="sm"
            bgColor="bg-void-950"
            actualBorderColor="bg-gold-300"
            borderThickness={1}
            iconColor="text-gold-300"
          />
          <div className="flex-1">
            <h3 className="text-sm font-light tracking-wide text-amber-200 mb-1"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {title}
            </h3>
            <p className="text-xs font-thin text-amber-300/70">{description}</p>
          </div>
          <span className="text-amber-300/60 text-sm group-hover:text-amber-200 transition-colors">→</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen">
      {/* Main background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
                      backgroundImage: `url(/images/main-bg.webp)`
        }}
      />
      
      {/* Content with clean background - no overlays */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <DiamondIcon
                icon={<BarChart3 size={20} strokeWidth={1.5} />}
                size="lg"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={2}
                iconColor="text-gold-300"
              />
              <div>
                <h1 className="text-4xl font-light tracking-[0.2em] text-amber-200 mb-2"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  COMMAND CENTER
                </h1>
                <p className="text-amber-300/80 font-light tracking-wide">
                  Welcome back{user ? `, ${user.user_metadata?.username || 'Explorer'}` : ''}! 
                  Monitor exploration progress across the Deep Desert and Hagga Basin territories.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <DiamondIcon
                icon={<TrendingUp size={16} strokeWidth={1.5} />}
                size="sm"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={1}
                iconColor="text-gold-300"
              />
              <h2 className="text-xl font-light tracking-widest text-amber-200 uppercase"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Intelligence Overview
              </h2>
            </div>
            <EnhancedStatisticsCards />
          </div>

          {/* Activity Feed and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <DiamondIcon
                  icon={<Activity size={16} strokeWidth={1.5} />}
                  size="sm"
                  bgColor="bg-void-950"
                  actualBorderColor="bg-gold-300"
                  borderThickness={1}
                  iconColor="text-gold-300"
                />
                <h2 className="text-xl font-light tracking-widest text-amber-200 uppercase"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Recent Operations
                </h2>
              </div>
              <ActivityFeed limit={15} />
            </div>

            {/* Quick Info Panel */}
            <div className="space-y-6">
              {/* Exploration Progress */}
              <div className="group relative">
                <div className="absolute inset-0 bg-amber-400 rounded-lg" />
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
                <div className="absolute inset-0.5 bg-gradient-to-b from-slate-700/20 via-transparent to-slate-950/40 rounded-lg" />
                <div 
                  className="absolute inset-0.5 rounded-lg"
                  style={{
                    background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(51, 65, 85, 0.4) 50%, rgba(15, 23, 42, 0.8) 100%)'
                  }}
                />
                <div className="relative p-6 rounded-lg">
                  <h3 className="text-lg font-light tracking-wide text-amber-200 mb-4 flex items-center gap-2"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    <Eye size={16} className="text-gold-300" />
                    Exploration Progress
                  </h3>
                  <ExplorationProgress />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="group relative">
                <div className="absolute inset-0 bg-amber-400 rounded-lg" />
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
                <div className="absolute inset-0.5 bg-gradient-to-b from-slate-700/20 via-transparent to-slate-950/40 rounded-lg" />
                <div 
                  className="absolute inset-0.5 rounded-lg"
                  style={{
                    background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(51, 65, 85, 0.4) 50%, rgba(15, 23, 42, 0.8) 100%)'
                  }}
                />
                <div className="relative p-6 rounded-lg">
                  <h3 className="text-lg font-light tracking-wide text-amber-200 mb-4 flex items-center gap-2"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    <Map size={16} className="text-gold-300" />
                    Navigation
                  </h3>
                  <div className="space-y-3">
                    <QuickActionCard
                      to="/deep-desert"
                      title="Deep Desert Grid"
                      description="A1-I9 exploration matrix"
                      icon={<Map size={14} strokeWidth={1.5} />}
                      gradient="bg-gradient-to-r from-amber-500/20 to-amber-600/20"
                    />
                    <QuickActionCard
                      to="/hagga-basin"
                      title="Hagga Basin Map"
                      description="Interactive territory map"
                      icon={<Map size={14} strokeWidth={1.5} />}
                      gradient="bg-gradient-to-r from-blue-500/20 to-blue-600/20"
                    />
                    <QuickActionCard
                      to="/pois"
                      title="POI Database"
                      description="Points of interest catalog"
                      icon={<Eye size={14} strokeWidth={1.5} />}
                      gradient="bg-gradient-to-r from-green-500/20 to-green-600/20"
                    />
                    {user?.role === 'admin' && (
                      <QuickActionCard
                        to="/admin"
                        title="Command Console"
                        description="Administrative interface"
                        icon={<Settings size={14} strokeWidth={1.5} />}
                        gradient="bg-gradient-to-r from-red-500/20 to-red-600/20"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Community Stats */}
              <div className="group relative">
                <div className="absolute inset-0 bg-amber-400 rounded-lg" />
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
                <div className="absolute inset-0.5 bg-gradient-to-b from-slate-700/20 via-transparent to-slate-950/40 rounded-lg" />
                <div 
                  className="absolute inset-0.5 rounded-lg"
                  style={{
                    background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(51, 65, 85, 0.4) 50%, rgba(15, 23, 42, 0.8) 100%)'
                  }}
                />
                <div className="relative p-6 rounded-lg">
                  <h3 className="text-lg font-light tracking-wide text-amber-200 mb-4 flex items-center gap-2"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    <Users size={16} className="text-gold-300" />
                    Community Status
                  </h3>
                  <CommunityStats />
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-12 text-center">
            <p className="text-sm font-light tracking-widest text-amber-300/60 uppercase"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Dune Awakening Tracker • Deep Desert & Hagga Basin • Community-driven exploration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 