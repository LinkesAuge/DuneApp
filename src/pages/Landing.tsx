import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { Map, Compass, Database, Users, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-sand-100">
      {/* Hero Section */}
      <div className="relative bg-sand-pattern bg-cover bg-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-night-950 bg-opacity-70"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Dune Awakening <span className="text-spice-500">Deep Desert Tracker</span>
          </h1>
          <p className="text-xl text-sand-100 max-w-3xl mx-auto mb-8">
            Map, track, and discover the hidden secrets of the deep desert with our collaborative exploration system.
          </p>
          
          {user ? (
            <Link 
              to="/grid" 
              className="btn btn-primary text-lg px-8 py-3"
            >
              Enter the Grid
              <ArrowRight className="ml-2" />
            </Link>
          ) : (
            <Link 
              to="/auth" 
              className="btn btn-primary text-lg px-8 py-3"
            >
              Start Exploring
              <ArrowRight className="ml-2" />
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-sand-50 shadow-md">
              <div className="inline-block p-3 rounded-full bg-spice-100 text-spice-600 mb-4">
                <Map size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Grid Map</h3>
              <p className="text-night-700">
                Track your exploration with our 9x9 grid system. Mark territories as explored and upload screenshots.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-sand-50 shadow-md">
              <div className="inline-block p-3 rounded-full bg-sky-100 text-sky-600 mb-4">
                <Compass size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Point of Interest Tracking</h3>
              <p className="text-night-700">
                Document and categorize important locations, resources, and discoveries in the deep desert.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-sand-50 shadow-md">
              <div className="inline-block p-3 rounded-full bg-night-100 text-night-600 mb-4">
                <Database size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Comprehensive Database</h3>
              <p className="text-night-700">
                Access a wealth of information on resources, locations, and strategic points throughout the desert.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-sand-50 shadow-md">
              <div className="inline-block p-3 rounded-full bg-green-100 text-green-600 mb-4">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Collaborative Mapping</h3>
              <p className="text-night-700">
                Work together with your faction to build the most complete map of the deep desert.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-night-950 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to explore the desert?</h2>
          <p className="text-xl text-sand-300 mb-8">
            Join our community of explorers and contribute to the most comprehensive map of Dune Awakening's deep desert.
          </p>
          {user ? (
            <Link 
              to="/grid" 
              className="btn btn-primary text-lg px-8 py-3"
            >
              Go to Grid Map
            </Link>
          ) : (
            <Link 
              to="/auth" 
              className="btn btn-primary text-lg px-8 py-3"
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;