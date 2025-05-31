// ImageSelector Component - Universal Image Browser for Shared Images System
// Supports search, filtering, upload, and selection for ALL entity types

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Upload, Plus, X, Tag, Image as ImageIcon, Filter } from 'lucide-react';
import { createPortal } from 'react-dom';
import DiamondIcon from '../common/DiamondIcon';
import { getSharedImages, getPopularImages, getRecentImages } from '../../lib/api/sharedImages';
import type { 
  SharedImageWithStats, 
  ImageSearchFilters, 
  ImageSelectorProps 
} from '../../types/sharedImages';
import { ImageUploader } from './ImageUploader';

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select an image or upload a new one",
  showTypeFilter = true,
  allowUpload = true,
  className = ""
}) => {
  // Component State
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<SharedImageWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'all' | 'search'>('popular');
  const [showUploader, setShowUploader] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageTypeFilter, setImageTypeFilter] = useState<string>('all');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Selected image state
  const [selectedImage, setSelectedImage] = useState<SharedImageWithStats | null>(null);

  // Load images based on active tab
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let imageData: SharedImageWithStats[] = [];
      
      switch (activeTab) {
        case 'popular':
          imageData = await getPopularImages(20);
          break;
        case 'recent':
          imageData = await getRecentImages(20);
          break;
        case 'all':
        case 'search':
          const filters: ImageSearchFilters = {
            search_query: searchQuery || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            image_type: imageTypeFilter !== 'all' ? imageTypeFilter as any : undefined,
            limit: 50
          };
          const response = await getSharedImages(filters);
          imageData = response.images;
          break;
      }
      
      setImages(imageData);
      
      // Extract unique tags for filtering
      const tags = new Set<string>();
      imageData.forEach(img => img.tags.forEach(tag => tags.add(tag)));
      setAvailableTags(Array.from(tags).sort());
      
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, selectedTags, imageTypeFilter]);

  // Load images when tab or filters change
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [loadImages, isOpen]);

  // Load selected image data
  useEffect(() => {
    if (value && isOpen) {
      const selected = images.find(img => img.id === value);
      setSelectedImage(selected || null);
    } else {
      setSelectedImage(null);
    }
  }, [value, images, isOpen]);

  // Handle image selection
  const handleImageSelect = (imageId: string | null) => {
    onChange(imageId);
    setIsOpen(false);
  };

  // Handle upload completion
  const handleUploadComplete = (newImage: SharedImageWithStats) => {
    // Add to current images list
    setImages(prev => [newImage, ...prev]);
    // Select the newly uploaded image
    handleImageSelect(newImage.id);
    setShowUploader(false);
  };

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setActiveTab('search');
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  // Get display info for selected image
  const getDisplayInfo = () => {
    if (selectedImage) {
      return {
        url: selectedImage.image_url,
        filename: selectedImage.filename,
        isImage: true
      };
    }
    return null;
  };

  const displayInfo = getDisplayInfo();

  const modalContent = isOpen ? (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1100]">
      <div className="bg-slate-800 border border-amber-300/30 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <div className="flex items-center gap-3">
            <DiamondIcon
              icon={<ImageIcon size={18} strokeWidth={1.5} />}
              size="md"
              bgColor="bg-slate-900"
              actualBorderColor="bg-amber-300"
              borderThickness={2}
              iconColor="text-amber-300"
            />
            <h3 className="text-lg font-light text-amber-300" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              Select Image
            </h3>
          </div>

          <div className="flex items-center gap-4">
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
              {[
                { key: 'popular', label: 'Popular' },
                { key: 'recent', label: 'Recent' },
                { key: 'all', label: 'All' },
                { key: 'search', label: 'Search' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-1 text-sm rounded transition-colors font-light ${
                    activeTab === tab.key
                      ? 'bg-amber-600/30 text-amber-300'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-amber-600/10'
                  }`}
                  style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {allowUpload && (
              <button
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-600 text-slate-900 text-sm font-light rounded-md hover:bg-amber-500 transition-colors"
                style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
              >
                <Plus className="w-4 h-4" />
                Upload New
              </button>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {(activeTab === 'search' || activeTab === 'all') && (
          <div className="p-4 border-b border-slate-600/50 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search images by name or description..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-amber-300/30 focus:border-amber-300/50
                         text-slate-200 placeholder-slate-400 font-light"
                style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
              />
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-4">
              {/* Type Filter */}
              {showTypeFilter && (
                <select
                  value={imageTypeFilter}
                  onChange={(e) => setImageTypeFilter(e.target.value)}
                  className="px-3 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-sm 
                           focus:outline-none focus:ring-2 focus:ring-amber-300/30 text-slate-200 font-light"
                  style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                >
                  <option value="all">All Types</option>
                  <option value="category">Categories</option>
                  <option value="type">Types</option>
                  <option value="tier">Tiers</option>
                  <option value="general">General</option>
                </select>
              )}

              {/* Tag Filters */}
              {availableTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {availableTags.slice(0, 8).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors font-light ${
                        selectedTags.includes(tag)
                          ? 'bg-amber-300/20 text-amber-300 border border-amber-300/30'
                          : 'bg-slate-800/30 text-slate-300 hover:bg-slate-700/30 hover:text-amber-300'
                      }`}
                      style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-300 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Active filters:
                </span>
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-300/20 text-amber-300 text-xs rounded-full border border-amber-300/30"
                    style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="hover:text-amber-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Images Grid */}
        <div className="flex-1 overflow-auto p-4 bg-slate-900/20">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-300"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-red-300">
              <p className="font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>{error}</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <ImageIcon className="w-12 h-12 mb-2" />
              <p className="font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>No images found</p>
              {activeTab === 'search' && (
                <p className="text-sm mt-1 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Try adjusting your search or filters
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {images.map(image => (
                <button
                  key={image.id}
                  onClick={() => handleImageSelect(image.id)}
                  className={`group relative aspect-square rounded-lg overflow-hidden transition-all hover:scale-105 ${
                    value === image.id
                      ? 'ring-2 ring-amber-300/50'
                      : 'hover:ring-1 hover:ring-amber-300/30'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Info Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/80 transition-all flex items-end">
                    <div className="w-full p-2 text-amber-200 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="truncate font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                        {image.filename}
                      </p>
                      {image.usage_count > 0 && (
                        <p className="text-slate-300 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                          Used {image.usage_count} times
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {value === image.id && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-amber-300 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-600/50">
          <p className="text-sm text-slate-300 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            {images.length} image{images.length !== 1 ? 's' : ''} available
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-slate-300 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors font-light"
              style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleImageSelect(null)}
              className="px-4 py-2 text-slate-300 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors font-light"
              style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {/* Image Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 p-3 border border-slate-600/50 rounded-lg 
                 hover:border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300/30 
                 bg-slate-800/20 hover:bg-slate-800/30 transition-all duration-200"
      >
        {displayInfo ? (
          <>
            <img 
              src={displayInfo.url} 
              alt={displayInfo.filename}
              className="w-8 h-8 object-cover rounded"
            />
            <span className="flex-1 text-left text-slate-200 font-light">{displayInfo.filename}</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-slate-400" />
            <span className="flex-1 text-left text-slate-300 font-light">{placeholder}</span>
          </>
        )}
        <Filter className="w-4 h-4 text-slate-400" />
      </button>

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleImageSelect(null);
          }}
          className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-300 hover:bg-red-600/10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Image Selection Modal using Portal */}
      {modalContent && createPortal(modalContent, document.body)}

      {/* Image Uploader Modal */}
      {showUploader && (
        <ImageUploader
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUploader(false)}
          defaultImageType={imageTypeFilter !== 'all' ? imageTypeFilter as any : 'general'}
        />
      )}
    </div>
  );
}; 