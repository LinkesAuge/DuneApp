import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Image, CheckCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const BaseMapUploader: React.FC = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 50MB for base maps)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(false);
  };

  const uploadBaseMap = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setError(null);

    try {
      // Upload image to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `hagga-basin-base-map.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      // Deactivate any existing base maps
      await supabase
        .from('hagga_basin_base_maps')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      // Create base map record
      const { error: dbError } = await supabase
        .from('hagga_basin_base_maps')
        .insert({
          name: 'Hagga Basin Official Map',
          description: 'Official map of the Hagga Basin region showing terrain features, landmarks, and accessible areas.',
          image_url: urlData.publicUrl,
          is_active: true,
          created_by: user.id
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      setSuccess(true);
      setSelectedFile(null);
      
    } catch (err) {
      console.error('Error uploading base map:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-sand-200">
      <div className="flex items-center mb-4">
        <Image className="w-6 h-6 text-spice-500 mr-2" />
        <h3 className="text-lg font-semibold text-sand-800">Upload Hagga Basin Base Map</h3>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">Base map uploaded successfully! Refresh the Hagga Basin page to see it.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* File Upload Area */}
        <div>
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-sand-300 rounded-lg cursor-pointer hover:border-sand-400 transition-colors">
            <div className="text-center">
              <Upload className="w-12 h-12 text-sand-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-sand-700 mb-2">
                {selectedFile ? selectedFile.name : 'Select Hagga Basin Map Image'}
              </h4>
              <p className="text-sm text-sand-500">
                PNG, JPG up to 50MB
              </p>
              <p className="text-xs text-sand-400 mt-2">
                Recommended: 4000x4000px for best quality
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="sr-only"
            />
          </label>
        </div>

        {/* Preview */}
        {selectedFile && (
          <div className="border border-sand-200 rounded-lg p-4">
            <h4 className="font-medium text-sand-700 mb-2">Preview:</h4>
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Base map preview"
              className="max-w-full h-48 object-contain mx-auto border border-sand-200 rounded"
            />
            <div className="mt-2 text-sm text-sand-600">
              <p>File: {selectedFile.name}</p>
              <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={uploadBaseMap}
          disabled={!selectedFile || uploading}
          className="w-full btn btn-primary"
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Uploading Base Map...
            </div>
          ) : (
            'Set as Active Base Map'
          )}
        </button>
      </div>

      <div className="mt-4 text-sm text-sand-500">
        <p>This will replace the current active base map for Hagga Basin.</p>
      </div>
    </div>
  );
};

export default BaseMapUploader; 