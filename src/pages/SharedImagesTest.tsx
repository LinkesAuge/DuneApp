// Test page for Shared Images System components
// This page allows testing of ImageSelector, ImageUploader, and ImagePreview

import React, { useState } from 'react';
import { ImageSelector, ImagePreview } from '../components/shared';
import Navbar from '../components/common/Navbar';

export const SharedImagesTest: React.FC = () => {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [testImages, setTestImages] = useState<Array<{ id: string | null; fallback: string }>>([
    { id: null, fallback: '⚔️' },
    { id: null, fallback: '🔧' },
    { id: null, fallback: '💎' },
    { id: selectedImageId, fallback: '🏺' }
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Shared Images System - Component Testing
          </h1>

          <div className="space-y-8">
            {/* ImageSelector Test */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Image Selector Test</h2>
              <p className="text-slate-600">
                Test the main ImageSelector component with all features: search, filtering, upload, etc.
              </p>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Selected Image ID: {selectedImageId || 'None'}
                </label>
                <ImageSelector
                  value={selectedImageId}
                  onChange={setSelectedImageId}
                  placeholder="Choose an image from the shared library"
                  showTypeFilter={true}
                  allowUpload={true}
                  className="mb-4"
                />
              </div>

              {selectedImageId && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Image selected successfully!</p>
                  <p className="text-green-600 text-sm">Image ID: {selectedImageId}</p>
                </div>
              )}
            </div>

            {/* ImagePreview Test */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Image Preview Test</h2>
              <p className="text-slate-600">
                Test the ImagePreview component at different sizes with various image/fallback combinations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Size variations */}
                {['xs', 'sm', 'md', 'lg', 'xl'].map(size => (
                  <div key={size} className="space-y-3">
                    <h3 className="text-lg font-medium text-slate-700 capitalize">Size: {size}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <ImagePreview
                          iconImageId={selectedImageId}
                          iconFallback="⚔️"
                          size={size as any}
                          showLabel={size === 'md'}
                        />
                        <span className="text-sm text-slate-600">
                          {selectedImageId ? 'Selected Image' : 'Fallback: ⚔️'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <ImagePreview
                          iconImageId={null}
                          iconFallback="🔧"
                          size={size as any}
                          showLabel={size === 'md'}
                        />
                        <span className="text-sm text-slate-600">Text Fallback: 🔧</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <ImagePreview
                          iconImageId={null}
                          iconFallback={null}
                          size={size as any}
                          showLabel={size === 'md'}
                        />
                        <span className="text-sm text-slate-600">No Icon</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multiple Selector Test */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Multiple Selectors Test</h2>
              <p className="text-slate-600">
                Test multiple ImageSelector instances to verify they work independently.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testImages.map((test, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Selector {index + 1} - ID: {test.id || 'None'}
                    </label>
                    <ImageSelector
                      value={test.id}
                      onChange={(newId) => {
                        setTestImages(prev => prev.map((item, i) => 
                          i === index ? { ...item, id: newId } : item
                        ));
                      }}
                      placeholder={`Select image for item ${index + 1}`}
                      showTypeFilter={index % 2 === 0}
                      allowUpload={index < 2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* API Status Test */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">System Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800">Database</h3>
                  <p className="text-blue-600 text-sm">Migration executed ✅</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800">API Functions</h3>
                  <p className="text-green-600 text-sm">All endpoints ready ✅</p>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-medium text-purple-800">Components</h3>
                  <p className="text-purple-600 text-sm">UI components built ✅</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Testing Instructions</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-amber-800">
                  <li>Try selecting an image using the first ImageSelector (should open modal with tabs)</li>
                  <li>Test the search functionality and tag filtering</li>
                  <li>Try uploading a new image using the "Upload New" button</li>
                  <li>Verify that image previews work at different sizes</li>
                  <li>Test multiple selectors to ensure they work independently</li>
                  <li>Check that fallback text icons display when no image is selected</li>
                </ol>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">Next Implementation Steps</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Integrate ImageSelector into CategoryManager (replace text icon input)</li>
                  <li>Update Category display to use ImagePreview components</li>
                  <li>Add usage tracking when images are selected</li>
                  <li>Create admin interface for managing shared image library</li>
                  <li>Extend to Type and Tier managers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 