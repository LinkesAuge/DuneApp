import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import HexButton from '../components/common/HexButton';
import HexCard from '../components/common/HexCard';
import DiamondIcon from '../components/common/DiamondIcon';
import { 
  Map, 
  Compass, 
  Database, 
  Users, 
  ArrowRight, 
  BarChart3,
  Activity,
  TrendingUp,
  Eye,
  MessageSquare,
  Camera,
  Shield,
  Zap,
  Star,
  Grid3X3,
  Mountain,
  Pyramid,
  Settings,
  Heart,
  Share,
  Image,
  Upload,
  Filter,
  Search,
  Layers,
  Globe
} from 'lucide-react';

const Landing: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen">
              {/* Hero Section - Dune-Inspired with main-bg.webp */}
      <div className="relative overflow-hidden">
        {/* Main background image */}
        <div 
          className="relative bg-cover bg-center text-white overflow-hidden"
          style={{
            backgroundImage: `url(/images/main-bg.webp?v=${Date.now()})`
          }}
        >
        {/* Minimal overlay only for text readability if needed */}
        {/* <div className="absolute inset-0 bg-slate-950/20" /> */}

        {/* Background hero image - positioned absolutely behind everything */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img 
              src={`/images/landing_top.webp?v=${Date.now()}`}
              alt="Dune Awakening Desert" 
              className="w-full max-w-2xl h-auto object-contain opacity-70"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <div className="text-center">
            {/* Logo section - positioned above background */}
            <div className="relative mb-8">
              <img 
                src={`/images/dune-log.webp?v=${Date.now()}`}
                alt="Dune Awakening Tracker Logo" 
                className="mx-auto w-full max-w-md h-auto object-contain drop-shadow-2xl"
              />
            </div>
            
            {/* Buttons section */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {user ? (
                <>
                  <HexButton 
                    to="/dashboard" 
                    icon={<BarChart3 size={18} strokeWidth={1.5} />}
                    size="lg"
                    variant="primary"
                  >
                    VIEW DASHBOARD
                  </HexButton>
                  
                  <HexButton 
                    to="/deep-desert" 
                    icon={<Pyramid size={18} strokeWidth={1.5} />}
                    size="lg"
                    variant="secondary"
                  >
                    ENTER DEEP DESERT
                  </HexButton>
                </>
              ) : (
                <HexButton 
                  to="/auth" 
                  icon={<ArrowRight size={20} strokeWidth={1.5} />}
                  size="lg"
                  variant="primary"
                >
                  BEGIN EXPEDITION
                </HexButton>
              )}
            </div>

            {/* Description text moved below buttons */}
            <div className="max-w-4xl mx-auto mb-16">
              {/* Elegant info box with transparent background */}
              <div className="relative">
                {/* Dark blue radial gradient background - from center outwards */}
                <div 
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 35%, rgba(15, 23, 42, 0.2) 55%, transparent 75%)'
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10 px-8 py-6">
                  <p 
                    className="text-lg md:text-xl text-amber-200 leading-relaxed font-light tracking-wide text-center"
                    style={{ 
                      fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
                    }}
                  >
                    The ultimate collaborative platform for mapping and discovering the hidden secrets of the deep desert. 
                    Professional-grade exploration tracking with advanced POI management, real-time collaboration, and comprehensive analytics.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Features Preview - Dune Styled */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { title: "Dual Map System", subtitle: "Grid & Interactive", icon: <Globe size={20} /> },
                { title: "Real-time", subtitle: "Collaboration", icon: <Activity size={20} /> },
                { title: "Advanced POI", subtitle: "Management", icon: <Database size={20} /> },
                { title: "Production", subtitle: "Analytics", icon: <BarChart3 size={20} /> }
              ].map((feature, index) => (
                <HexCard 
                  key={index}
                  variant="feature" 
                  size="sm"
                  icon={feature.icon}
                  title={feature.title}
                  subtitle={feature.subtitle}
                />
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Section - No backgrounds */}
      <div className="relative py-12">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <DiamondIcon 
                icon={<Star size={18} strokeWidth={1.5} className="text-gold-300" />} 
                size="sm" 
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={1}
              />
              <span className="font-light text-yellow-300 tracking-[0.15em] uppercase text-lg" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Production Features
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.1em] text-yellow-300 mb-6" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              ADVANCED DESERT MAPPING
            </h2>
            <p className="text-xl text-amber-200 max-w-3xl mx-auto font-light tracking-wide">
              Professional-grade exploration tools with dual mapping systems, real-time collaboration, and comprehensive analytics
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-8">
              {[
                {
                  icon: <Grid3X3 size={24} strokeWidth={1.5} />,
                  title: "Dual Map System",
                  description: "Navigate both Deep Desert grid (9x9 sectors) and interactive Hagga Basin coordinate mapping with unified POI management and real-time exploration tracking."
                },
                {
                  icon: <Database size={24} strokeWidth={1.5} />,
                  title: "Advanced POI Management",
                  description: "Comprehensive point-of-interest system with sharing, privacy controls, and unified panel interface across both map systems."
                },
                {
                  icon: <Activity size={24} strokeWidth={1.5} />,
                  title: "Real-time Collaboration",
                  description: "Live updates, comment threading, emoji reactions, screenshot galleries, and exploration progress tracking with community-driven content creation."
                },
                {
                  icon: <BarChart3 size={24} strokeWidth={1.5} />,
                  title: "Production Analytics",
                  description: "Comprehensive dashboard with exploration statistics, community metrics, activity feeds, and administrative tools for platform management."
                }
              ].map((feature, index) => (
                <div key={index} className="group flex gap-6">
                  <DiamondIcon 
                    icon={feature.icon} 
                    size="md" 
                    bgColor="bg-void-950"
                    actualBorderColor="bg-gold-300/70"
                    borderThickness={1}
                    iconColor="text-gold-300"
                    className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div>
                    <h3 className="text-2xl font-light text-yellow-300 mb-3 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {feature.title}
                    </h3>
                    <p className="text-amber-200 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:order-first">
              <div className="relative">
                {/* Mock Dashboard Interface */}
                <HexCard variant="secondary" size="lg" hoverable={false} className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart3 className="text-yellow-400" size={24} strokeWidth={1.5} />
                      <h4 className="font-light text-yellow-300 text-xl tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        Community Overview
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "4,847", label: "Total POIs", color: "violet" },
                        { value: "2,293", label: "Comments", color: "yellow" },
                        { value: "89", label: "Explored", color: "green" },
                        { value: "1,856", label: "Screenshots", color: "blue" }
                      ].map((stat, i) => (
                        <div key={i} className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-lg p-4 border border-slate-700/20">
                          <div className={`text-2xl font-light mb-1 ${
                            stat.color === 'violet' ? 'text-violet-400' :
                            stat.color === 'yellow' ? 'text-yellow-400' :
                            stat.color === 'green' ? 'text-green-400' : 'text-blue-400'
                          }`}>
                            {stat.value}
                          </div>
                          <div className="text-xs text-yellow-400/60 uppercase tracking-widest">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-lg p-6 border border-slate-700/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="text-yellow-400" size={20} strokeWidth={1.5} />
                      <h5 className="font-light text-yellow-300 tracking-wide">Recent Activity</h5>
                    </div>
                    <div className="space-y-3">
                      {[
                        { type: "POI", text: "Spice harvester station discovered", time: "2m ago", color: "violet" },
                        { type: "Comment", text: "Strategic discussion on location C4", time: "5m ago", color: "yellow" },
                        { type: "Exploration", text: "Grid sector B7 fully mapped", time: "12m ago", color: "green" }
                      ].map((activity, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.color === 'violet' ? 'bg-violet-500' :
                            activity.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-amber-200 flex-1">{activity.text}</span>
                          <span className="text-yellow-400/50 text-xs">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </HexCard>
              </div>
            </div>
          </div>

          {/* Technical Capabilities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Mountain size={28} strokeWidth={1.5} />,
                title: "Hagga Basin Interactive",
                description: "Coordinate-based mapping with zoom/pan controls, overlay layers, base map management, and precise POI positioning for strategic exploration."
              },
              {
                icon: <Pyramid size={28} strokeWidth={1.5} />,
                title: "Deep Desert Grid",
                description: "Systematic 9x9 sector exploration with screenshot documentation, progress tracking, and collaborative territory mapping for comprehensive coverage."
              },
              {
                icon: <MessageSquare size={28} strokeWidth={1.5} />,
                title: "Community Engagement",
                description: "Threaded comment system with emoji reactions, like/dislike functionality, and real-time discussion threads for collaborative intelligence sharing."
              },
              {
                icon: <Camera size={28} strokeWidth={1.5} />,
                title: "Visual Documentation",
                description: "Advanced screenshot management with cropping tools, gallery views, metadata tracking, and automatic exploration status synchronization."
              },
              {
                icon: <Shield size={28} strokeWidth={1.5} />,
                title: "Administrative Control",
                description: "Comprehensive admin panel with user management, data backup/restore, scheduled tasks, and platform configuration for operational excellence."
              },
              {
                icon: <Share size={28} strokeWidth={1.5} />,
                title: "Data Intelligence",
                description: "Advanced filtering, search, sorting, privacy controls, and sharing mechanisms for efficient information organization."
              }
            ].map((capability, index) => (
              <HexCard 
                key={index}
                variant="primary"
                size="lg"
                icon={capability.icon}
                title={capability.title}
                description={capability.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action - No backgrounds */}
      <div className="relative py-12">
        <div className="relative max-w-5xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.1em] text-yellow-300 mb-8" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            MASTER THE DEEP DESERT
          </h2>
          <p className="text-xl text-amber-200 mb-12 leading-relaxed font-light tracking-wide max-w-3xl mx-auto">
            Join the most advanced exploration community in Dune Awakening. Contribute to the definitive mapping project 
            and access professional-grade tools for desert mastery.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {user ? (
              <>
                <HexButton 
                  to="/dashboard" 
                  icon={<BarChart3 size={20} strokeWidth={1.5} />}
                  size="lg"
                  variant="primary"
                >
                  COMMAND CENTER
                </HexButton>
                
                <HexButton 
                  to="/deep-desert" 
                  icon={<Map size={20} strokeWidth={1.5} />}
                  size="lg"
                  variant="secondary"
                >
                  EXPLORE DESERT
                </HexButton>
              </>
            ) : (
              <HexButton 
                to="/auth" 
                icon={<ArrowRight size={24} strokeWidth={1.5} />}
                size="lg"
                variant="primary"
              >
                JOIN EXPEDITION
              </HexButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;