import React from 'react';
import { Camera, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UnifiedImageSystemDemo } from '../components/test/UnifiedImageSystemDemo';

const UnifiedImageTestPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Main background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/images/main-bg.webp)` }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent" />
          
          <div className="relative p-6 border-b border-amber-400/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/items" 
                  className="p-2 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded-full transition-colors"
                  title="Back to Items & Schematics"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center space-x-3">
                  <Camera className="w-6 h-6 text-amber-200/70" />
                  <h1 className="text-2xl font-light text-amber-200 tracking-wide"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Unified Image System Demo
                  </h1>
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-amber-200/70 font-light max-w-3xl"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Test the comprehensive unified image management system for POIs, Comments, Items, and Schematics. 
              Upload, crop, manage, and link images across all entity types with a single, consistent interface.
            </p>
          </div>
        </div>

        {/* Demo Content */}
        <div className="p-6">
          <UnifiedImageSystemDemo />
        </div>
      </div>
    </div>
  );
};

export default UnifiedImageTestPage; 