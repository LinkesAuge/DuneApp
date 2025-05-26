import React, { useState, useCallback } from 'react';
import { X, Upload, Trash2, Image, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { CustomIcon } from '../../types';
import { useAuth } from '../auth/AuthProvider';

interface CustomIconsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customIcons: CustomIcon[];
  onIconUploaded?: (icon: CustomIcon) => void;
  onIconDeleted?: (iconId: string) => void;
}

const CustomIconsModal: React.FC<CustomIconsModalProps> = ({
  isOpen,
  onClose,
  customIcons,
  onIconUploaded,
  onIconDeleted
}) => {
  const { user } = useAuth();
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/png')) {
      return 'Only PNG images are supported';
    }

    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      return 'File size must be less than 1MB';
    }

    // Check user limit (max 10 icons)
    if (customIcons.length >= 10) {
      return 'Maximum 10 custom icons allowed per user';
    }

    return null;
  };

  const uploadIcon = async (file: File, name: string) => {
    if (!user) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots') // Using existing bucket with icons/ subfolder
        .upload(`icons/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(`icons/${fileName}`);

      // Create database record
      const { data, error } = await supabase
        .from('custom_icons')
        .insert({
          user_id: user.id,
          name: name,
          image_url: publicUrl
        })
        .select()
        .single();

      if (error) throw error;

      // Call callback
      if (onIconUploaded) {
        onIconUploaded(data);
      }

    } catch (err) {
      console.error('Error uploading custom icon:', err);
      setUploadError('Failed to upload icon. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    // Extract name from filename (without extension)
    const defaultName = file.name.replace(/\.[^/.]+$/, '');
    const iconName = prompt('Enter a name for this icon:', defaultName);
    
    if (!iconName || !iconName.trim()) {
      setUploadError('Icon name is required');
      return;
    }

    await uploadIcon(file, iconName.trim());
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDeleteIcon = async (icon: CustomIcon) => {
    if (!confirm(`Are you sure you want to delete "${icon.name}"?`)) {
      return;
    }

    setDeleting(icon.id);

    try {
      // Extract filename from URL
      const url = new URL(icon.image_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const fullPath = `icons/${fileName}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('screenshots')
        .remove([fullPath]);

      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error } = await supabase
        .from('custom_icons')
        .delete()
        .eq('id', icon.id);

      if (error) throw error;

      // Call callback
      if (onIconDeleted) {
        onIconDeleted(icon.id);
      }

    } catch (err) {
      console.error('Error deleting custom icon:', err);
      setUploadError('Failed to delete icon. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-night-950/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200">
          <h3 className="text-lg font-semibold text-sand-800">Custom Icons</h3>
          <button
            onClick={onClose}
            className="text-sand-500 hover:text-sand-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Custom Icon Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-600">
                <li>PNG format only, maximum 1MB file size</li>
                <li>Up to 10 custom icons per user</li>
                <li>Recommended size: 32x32 or 64x64 pixels</li>
                <li>Transparent backgrounds work best</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700 text-sm">{uploadError}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-sand-700 mb-3">
              Upload New Icon
            </label>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? 'border-spice-400 bg-spice-50'
                  : 'border-sand-300 hover:border-sand-400'
              }`}
            >
              {uploading ? (
                <div className="py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spice-600 mx-auto mb-2"></div>
                  <p className="text-sand-600">Uploading icon...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-sand-400 mx-auto mb-4" />
                  <p className="text-sand-600 mb-2">Drag and drop a PNG file here, or</p>
                  <label className="btn btn-outline cursor-pointer">
                    Choose File
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                        e.target.value = ''; // Reset input
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sand-500 text-sm mt-2">
                    {customIcons.length}/10 icons used
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Existing Icons */}
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-3">
              Your Custom Icons
            </label>
            
            {customIcons.length === 0 ? (
              <div className="text-center py-8">
                <Image className="w-12 h-12 text-sand-400 mx-auto mb-4" />
                <p className="text-sand-600">No custom icons yet</p>
                <p className="text-sand-500 text-sm">Upload your first custom icon above</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {customIcons.map(icon => (
                  <div key={icon.id} className="relative group">
                    <div className="bg-sand-50 border border-sand-200 rounded-lg p-3 text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-white rounded border border-sand-200 flex items-center justify-center">
                        <img
                          src={icon.image_url}
                          alt={icon.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <p className="text-sm font-medium text-sand-800 truncate">{icon.name}</p>
                      <p className="text-xs text-sand-500">
                        {new Date(icon.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteIcon(icon)}
                      disabled={deleting === icon.id}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting === icon.id ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomIconsModal; 