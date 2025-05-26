import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
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
  Star
} from 'lucide-react';

const Landing: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-sand-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-night-900 via-night-800 to-spice-900"></div>
        <div className="absolute inset-0 bg-sand-pattern bg-cover bg-center opacity-20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-spice-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-night-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-sand-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Dune Awakening
              <br />
              <span className="bg-gradient-to-r from-spice-400 to-spice-600 bg-clip-text text-transparent">
                Deep Desert Tracker
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-sand-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              The ultimate collaborative platform for mapping, tracking, and discovering the hidden secrets of the deep desert. 
              Join thousands of explorers building the most comprehensive database of Dune Awakening.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <BarChart3 className="mr-2" size={20} />
                    View Dashboard
                  </Link>
                  <Link 
                    to="/grid" 
                    className="btn btn-secondary text-lg px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                  >
                    <Map className="mr-2" size={20} />
                    Enter Grid Map
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Start Exploring
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                                     <p className="text-sand-200 text-sm">
                     Join our community of desert explorers
                   </p>
                </>
              )}
            </div>

            {/* Key Features Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-lg font-bold text-spice-400 mb-1">Interactive</div>
                <div className="text-sm text-sand-200">Grid Mapping</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-lg font-bold text-spice-400 mb-1">Real-time</div>
                <div className="text-sm text-sand-200">Collaboration</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-lg font-bold text-spice-400 mb-1">Comprehensive</div>
                <div className="text-sm text-sand-200">POI Database</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-lg font-bold text-spice-400 mb-1">Smart</div>
                <div className="text-sm text-sand-200">Dashboard</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Feature Highlight */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-spice-100 text-spice-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star size={16} />
              New Feature
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-night-900 mb-6">
              Comprehensive Dashboard
            </h2>
            <p className="text-xl text-night-600 max-w-3xl mx-auto">
              Get instant insights into your exploration progress, community activity, and desert mapping statistics
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-spice-500 to-spice-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-night-900 mb-2">Real-time Statistics</h3>
                  <p className="text-night-600">
                    Track total POIs, community contributions, exploration progress, and user activity with live updating statistics.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-night-900 mb-2">Activity Feed</h3>
                  <p className="text-night-600">
                    Stay updated with recent discoveries, new POIs, comments, and exploration activities from the community.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-night-900 mb-2">Progress Tracking</h3>
                  <p className="text-night-600">
                    Visualize exploration progress with interactive charts and see how much of the desert has been mapped.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-night-900 mb-2">Quick Actions</h3>
                  <p className="text-night-600">
                    Jump directly to grid mapping, POI browsing, or admin functions with convenient quick action buttons.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:order-first">
              <div className="bg-gradient-to-br from-sand-50 to-sand-100 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="text-spice-600" size={24} />
                    <h4 className="font-bold text-night-900">Statistics Overview</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">2,847</div>
                      <div className="text-sm text-blue-700">Total POIs</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">1,293</div>
                      <div className="text-sm text-green-700">Comments</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-orange-600">76</div>
                      <div className="text-sm text-orange-700">Explored Areas</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">1,856</div>
                      <div className="text-sm text-purple-700">Screenshots</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="text-spice-600" size={20} />
                    <h5 className="font-semibold text-night-900">Recent Activity</h5>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-night-600">New POI added in Grid C4</span>
                      <span className="text-sand-500 ml-auto">2m ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-night-600">Comment on Spice Mine location</span>
                      <span className="text-sand-500 ml-auto">5m ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-night-600">Grid B7 marked as explored</span>
                      <span className="text-sand-500 ml-auto">12m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="py-20 bg-gradient-to-br from-sand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-night-900 mb-6">
              Powerful Features for Desert Exploration
            </h2>
            <p className="text-xl text-night-600 max-w-3xl mx-auto">
              Everything you need to map, track, and discover the secrets of Dune Awakening's deep desert
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-spice-500 to-spice-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Map className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-night-900 mb-4">Interactive Grid Map</h3>
              <p className="text-night-600 leading-relaxed">
                Navigate through our comprehensive 9x9 grid system. Mark territories as explored, upload screenshots, and track your progression through the vast desert landscape.
              </p>
            </div>
            
            <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Compass className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-night-900 mb-4">POI Management</h3>
              <p className="text-night-600 leading-relaxed">
                Document and categorize points of interest with custom types, detailed descriptions, screenshots, and location data. Create a comprehensive database of discoveries.
              </p>
            </div>
            
            <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-night-900 mb-4">Community Comments</h3>
              <p className="text-night-600 leading-relaxed">
                Share insights, strategies, and discoveries with the community. Comment on POIs, share screenshots, and collaborate with fellow explorers.
              </p>
            </div>

            <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Database className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-night-900 mb-4">Comprehensive Database</h3>
              <p className="text-night-600 leading-relaxed">
                Access detailed information on resources, locations, and strategic points. Filter, search, and organize data to plan your next expedition effectively.
              </p>
            </div>
            
            <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-night-900 mb-4">Collaborative Platform</h3>
              <p className="text-night-600 leading-relaxed">
                Work together with your faction and the broader community. Share discoveries, coordinate exploration efforts, and build the most complete desert map.
              </p>
            </div>

            <div className="group bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-night-900 mb-4">Admin Tools</h3>
              <p className="text-night-600 leading-relaxed">
                Powerful administration features for managing users, POI types, data backup and restoration, and maintaining the quality of community contributions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-night-900 via-night-800 to-spice-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-sand-pattern bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Conquer the Desert?
          </h2>
          <p className="text-xl text-sand-200 mb-8 leading-relaxed">
            Join our thriving community of explorers and contribute to the most comprehensive mapping project in Dune Awakening. 
            Start your journey today and leave your mark on the deep desert.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <BarChart3 className="mr-2" size={20} />
                  Open Dashboard
                </Link>
                <Link 
                  to="/grid" 
                  className="btn btn-secondary text-lg px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                >
                  <Map className="mr-2" size={20} />
                  Explore Grid Map
                </Link>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Join the Expedition
                <ArrowRight className="ml-2" size={20} />
              </Link>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default Landing;