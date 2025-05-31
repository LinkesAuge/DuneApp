// ImageUploader Component - Drag-drop image upload for Shared Images System
// Handles file validation, preview, metadata entry, and upload to storage

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Tag, AlertCircle, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import DiamondIcon from '../common/DiamondIcon';
import { uploadSharedImage, validateImageFile } from '../../lib/api/sharedImages';
import type { SharedImageWithStats, SharedImageUpload } from '../../types/sharedImages';

interface ImageUploaderProps {
  onUploadComplete: (image: SharedImageWithStats) => void;
  onClose: () => void;
  defaultImageType?: 'category' | 'type' | 'tier' | 'general';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onClose,
  defaultImageType = 'general'
}) => {
  // Component State
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Form State
  const [imageType, setImageType] = useState<'category' | 'type' | 'tier' | 'general'>(defaultImageType);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setErrors([]);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const uploadData: SharedImageUpload = {
        file: selectedFile,
        image_type: imageType,
        tags: tags,
        description: description.trim() || undefined
      };

      const uploadedImage = await uploadSharedImage(uploadData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        onUploadComplete(uploadedImage as SharedImageWithStats);
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      setErrors(['Failed to upload image. Please try again.']);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTags([]);
    setTagInput('');
    setDescription('');
    setErrors([]);
    setUploadProgress(0);
    setUploading(false);
  };

  return createPortal(
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1100]">
      <div className="bg-slate-800 border border-amber-300/30 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <div className="flex items-center gap-3">
            <DiamondIcon
              icon={<Upload size={18} strokeWidth={1.5} />}
              size="md"
              bgColor="bg-slate-900"
              actualBorderColor="bg-amber-300"
              borderThickness={2}
              iconColor="text-amber-300"
            />
            <h3 className="text-lg font-light text-amber-300" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              Upload New Image
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-amber-300/50 bg-amber-600/10'
                  : 'border-slate-600/50 hover:border-amber-300/40'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="w-12 h-12 text-slate-400" />
                </div>
                
                <div>
                  <p className="text-lg font-light text-slate-200" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    Drop your image here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-amber-300 hover:text-amber-200 underline"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-sm text-slate-400 mt-2 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    JPEG, PNG, WebP, or GIF up to 1MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            /* File Preview */
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={resetForm}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500"
                    disabled={uploading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <p className="font-light text-slate-200" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-slate-400 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-300 mt-0.5" />
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-200 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Metadata Form */}
          {selectedFile && (
            <div className="space-y-4">
              {/* Image Type */}
              <div>
                <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Image Type (Organization Only)
                </label>
                <select
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-amber-300/30 text-slate-200 font-light"
                  style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                  disabled={uploading}
                >
                  <option value="general">General</option>
                  <option value="category">Category</option>
                  <option value="type">Type</option>
                  <option value="tier">Tier</option>
                </select>
                <p className="text-xs text-slate-400 mt-1 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  This is just for organization - the image can be used anywhere
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Tags (helps others find your image)
                </label>
                
                <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-2 focus-within:ring-2 focus-within:ring-amber-300/30">
                  {/* Tag Display */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-300/20 text-amber-300 text-xs rounded-full border border-amber-300/30"
                        style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-amber-100"
                          disabled={uploading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {/* Tag Input */}
                  <input
                    type="text"
                    placeholder="Add tags (press Enter or comma to add)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={addTag}
                    className="w-full border-none outline-none text-sm bg-transparent text-slate-200 placeholder-slate-400 font-light"
                    style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                    disabled={uploading}
                  />
                </div>
                
                <p className="text-xs text-slate-400 mt-1 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Examples: weapon, tool, resource, sword, crafting, etc.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this image to help others understand when to use it..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-amber-300/30 resize-none
                           text-slate-200 placeholder-slate-400 font-light"
                  style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                  disabled={uploading}
                />
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Uploading...
                </span>
                <span className="text-slate-300 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-800/30 rounded-full h-2">
                <div
                  className="bg-amber-300 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadProgress === 100 && (
                <div className="flex items-center gap-2 text-green-300 text-sm">
                  <Check className="w-4 h-4" />
                  <span className="font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    Upload complete!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-700/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || errors.length > 0}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-slate-900 rounded-lg 
                     hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}; 