import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Image, Package, FileText, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadSharedImage } from '../../lib/api/sharedImages';
import DiamondIcon from '../common/DiamondIcon';

interface EntityIconStatus {
  id: string;
  name: string;
  icon: string;
  hasIcon: boolean;
  hasIconId: boolean;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  sharedImageId?: string;
}

interface SharedImage {
  id: string;
  filename: string;
  image_url: string;
  image_type: string;
  file_size: number;
  mime_type: string;
  tags: string[];
  description: string;
  created_at: string;
  is_active: boolean;
}

interface SharedImagesManagementProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const SharedImagesManagement: React.FC<SharedImagesManagementProps> = ({ onError, onSuccess }) => {
  const [activeSubTab, setActiveSubTab] = useState<'entity-icons' | 'browse' | 'upload'>('entity-icons');
  const [entities, setEntities] = useState<EntityIconStatus[]>([]);
  const [sharedImages, setSharedImages] = useState<SharedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [entityIconFiles, setEntityIconFiles] = useState<FileList | null>(null);

  // Load entities and shared images status
  useEffect(() => {
    if (activeSubTab === 'entity-icons') {
      loadEntitiesStatus();
    } else if (activeSubTab === 'browse') {
      loadSharedImages();
    }
  }, [activeSubTab, entityIconFiles]); // Add entityIconFiles as dependency

  const loadEntitiesStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch entities with icon references
      const { data: entitiesData, error: entitiesError } = await supabase
        .from('entities')
        .select('id, name, icon, icon_image_id')
        .neq('icon', null);

      if (entitiesError) throw entitiesError;

      // Track which files are currently selected for upload
      const selectedIconFiles = new Set(
        entityIconFiles ? Array.from(entityIconFiles).map(file => file.name) : []
      );
      setSelectedFiles(selectedIconFiles);

      const entityStatuses: EntityIconStatus[] = entitiesData.map(entity => ({
        id: entity.id,
        name: entity.name,
        icon: entity.icon,
        hasIcon: !!entity.icon && entity.icon.trim() !== '',
        hasIconId: !!entity.icon_image_id,
        status: entity.icon_image_id ? 'success' : 'pending'
      }));

      setEntities(entityStatuses);
    } catch (error) {
      console.error('Error loading entities:', error);
      onError('Failed to load entities status');
    } finally {
      setLoading(false);
    }
  };

  const loadSharedImages = async () => {
    try {
      setLoading(true);
      
      const { data: imagesData, error: imagesError } = await supabase
        .from('shared_images')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (imagesError) throw imagesError;

      setSharedImages(imagesData || []);
    } catch (error) {
      console.error('Error loading shared images:', error);
      onError('Failed to load shared images');
    } finally {
      setLoading(false);
    }
  };

  const uploadEntityIcons = async () => {
    // Check if files are selected
    if (!entityIconFiles) {
      onError('Please select entity icon files first!');
      return;
    }

    // Get available file names
    const availableFiles = new Set(Array.from(entityIconFiles).map(file => file.name));
    
    // Filter entities that need upload AND have matching files
    const entitiesNeedingUpload = entities.filter(e => 
      e.hasIcon && !e.hasIconId && e.status === 'pending' && availableFiles.has(e.icon)
    );

    if (entitiesNeedingUpload.length === 0) {
      onError('No entities need icon upload! Make sure you selected the correct icon files.');
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: entitiesNeedingUpload.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < entitiesNeedingUpload.length; i++) {
      const entity = entitiesNeedingUpload[i];
      
      try {
        // Update status to uploading
        setEntities(prev => prev.map(e => 
          e.id === entity.id ? { ...e, status: 'uploading' } : e
        ));

        // Find the matching file from the selected entity icon files
        if (!entityIconFiles) {
          throw new Error('No entity icon files selected');
        }

        const matchingFile = Array.from(entityIconFiles).find(file => file.name === entity.icon);
        if (!matchingFile) {
          throw new Error(`File not found: ${entity.icon}`);
        }

        // Upload to Supabase Storage using the shared images system
        const insertedImageData = await uploadSharedImage({
          file: matchingFile,
          image_type: 'entity_icon', // Use correct entity_icon type
          tags: ['entity', 'icon', 'game-asset'],
          description: `Entity icon: ${entity.name}`
        });

        // Update entity with shared image ID
        console.log(`Updating entity ${entity.id} with image ID ${insertedImageData.id}`);
        const { data: updateData, error: updateError } = await supabase
          .from('entities')
          .update({ icon_image_id: insertedImageData.id })
          .eq('id', entity.id);

        console.log('Update result:', { updateData, updateError });
        if (updateError) {
          console.error('Entity update failed:', updateError);
          throw updateError;
        }

        // Update status to success
        setEntities(prev => prev.map(e => 
          e.id === entity.id ? { 
            ...e, 
            status: 'success', 
            hasIconId: true,
            sharedImageId: insertedImageData.id 
          } : e
        ));

        successCount++;

      } catch (error) {
        console.error(`Error uploading entity icon for ${entity.name}:`, error);
        setEntities(prev => prev.map(e => 
          e.id === entity.id ? { 
            ...e, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : e
        ));
        errorCount++;
      }

      setProgress({ current: i + 1, total: entitiesNeedingUpload.length });
    }

    setUploading(false);
    
    // Reload entities status to refresh the stats
    await loadEntitiesStatus();
    
    if (successCount > 0) {
      onSuccess(`Successfully uploaded ${successCount} entity icons to Supabase Storage`);
    }
    if (errorCount > 0) {
      onError(`Failed to upload ${errorCount} entity icons`);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      onError('Please select files to upload');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      
      try {
        await uploadSharedImage({
          file: file,
          image_type: 'general',
          tags: ['uploaded', 'admin'],
          description: `Uploaded via admin panel: ${file.name}`
        });
        successCount++;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errorCount++;
      }
    }

    setUploading(false);
    setUploadFiles(null);
    
    if (successCount > 0) {
      onSuccess(`Successfully uploaded ${successCount} files`);
      loadSharedImages(); // Refresh the list
    }
    if (errorCount > 0) {
      onError(`Failed to upload ${errorCount} files`);
    }
  };

  const deleteSharedImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('shared_images')
        .update({ is_active: false })
        .eq('id', imageId);

      if (error) throw error;

      onSuccess('Image deleted successfully');
      loadSharedImages(); // Refresh the list
    } catch (error) {
      console.error('Error deleting image:', error);
      onError('Failed to delete image');
    }
  };

  const stats = {
    total: entities.length,
    withIcons: entities.filter(e => e.hasIcon).length,
    alreadyUploaded: entities.filter(e => e.hasIconId).length,
    needingUpload: entities.filter(e => e.hasIcon && !e.hasIconId).length,
    errors: entities.filter(e => e.status === 'error').length
  };

  const subTabs = [
    { id: 'entity-icons' as const, label: 'Entity Icons', icon: Package },
    { id: 'browse' as const, label: 'Browse Images', icon: Image },
    { id: 'upload' as const, label: 'Upload Images', icon: Upload }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <DiamondIcon
          icon={<Image size={20} strokeWidth={1.5} />}
          size="lg"
          bgColor="bg-void-950"
          actualBorderColor="bg-gold-300"
          borderThickness={2}
          iconColor="text-gold-300"
        />
        <div>
          <h2 className="text-xl font-light text-gold-300 mb-1"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            SHARED IMAGES MANAGEMENT
          </h2>
          <p className="text-amber-200/80 text-sm font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Manage entity icons and shared images system
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex space-x-1 p-1 rounded-lg border border-gold-300/20"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300
              ${activeSubTab === tab.id 
                ? 'bg-gold-300/20 text-gold-300 border border-gold-300/40' 
                : 'text-amber-200/70 hover:text-gold-300 hover:bg-gold-300/10'
              }
            `}
          >
            <tab.icon size={16} />
            <span className="text-sm font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Entity Icons Tab */}
      {activeSubTab === 'entity-icons' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg border border-gold-300/20"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
              <div className="text-2xl font-bold text-gold-300">{stats.total}</div>
              <div className="text-amber-200/60 text-sm">Total Entities</div>
            </div>
            <div className="p-4 rounded-lg border border-gold-300/20"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
              <div className="text-2xl font-bold text-blue-300">{stats.withIcons}</div>
              <div className="text-amber-200/60 text-sm">With Icons</div>
            </div>
            <div className="p-4 rounded-lg border border-gold-300/20"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
              <div className="text-2xl font-bold text-green-300">{stats.alreadyUploaded}</div>
              <div className="text-amber-200/60 text-sm">Already Uploaded</div>
            </div>
            <div className="p-4 rounded-lg border border-gold-300/20"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
              <div className="text-2xl font-bold text-amber-300">{stats.needingUpload}</div>
              <div className="text-amber-200/60 text-sm">Need Upload</div>
            </div>
            <div className="p-4 rounded-lg border border-gold-300/20"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
              <div className="text-2xl font-bold text-red-300">{stats.errors}</div>
              <div className="text-amber-200/60 text-sm">Errors</div>
            </div>
          </div>

          {/* File Selection */}
          <div className="p-6 rounded-lg border border-gold-300/20"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
            <h3 className="text-lg font-light text-gold-300 mb-4"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Select Entity Icon Files
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  Select your entity icons folder (choose all .webp files)
                </label>
                                 <input
                   type="file"
                   multiple
                   accept=".webp,image/webp"
                   onChange={(e) => {
                     setEntityIconFiles(e.target.files);
                   }}
                  className="w-full p-3 border border-gold-300/30 rounded-lg bg-slate-800/50 text-gold-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-600/20 file:text-gold-300 hover:file:bg-gold-600/30"
                />
                {entityIconFiles && (
                  <p className="text-amber-200/60 text-sm mt-2">
                    Selected {entityIconFiles.length} files
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div>
            <button
              onClick={uploadEntityIcons}
              disabled={uploading || stats.needingUpload === 0 || !entityIconFiles}
              className="px-6 py-3 bg-gold-600/20 hover:bg-gold-600/30 disabled:bg-gold-600/10 disabled:cursor-not-allowed text-gold-300 border border-gold-300/40 rounded-lg transition-colors flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading {progress.current}/{progress.total}...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload {stats.needingUpload} Entity Icons</span>
                </>
              )}
            </button>
            {!entityIconFiles && (
              <p className="text-amber-200/60 text-sm mt-2">
                Please select entity icon files first
              </p>
            )}

          </div>

          {/* Progress */}
          {uploading && (
            <div className="p-4 rounded-lg border border-gold-300/20"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
              <div className="flex justify-between text-gold-300 text-sm mb-2">
                <span>Upload Progress</span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gold-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Entity List */}
          <div className="rounded-lg border border-gold-300/20 overflow-hidden"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
            <div className="p-4 border-b border-gold-300/20">
              <h3 className="text-lg font-light text-gold-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Entity Status
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gold-300 animate-spin" />
                  <span className="ml-2 text-gold-300">Loading entities...</span>
                </div>
              ) : (
                entities.map(entity => (
                  <div key={entity.id} className="flex items-center justify-between p-4 border-b border-gold-300/10 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gold-300 truncate">{entity.name}</div>
                      <div className="text-amber-200/60 text-sm">{entity.icon}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Icon Status */}
                      <div className={`w-3 h-3 rounded-full ${entity.hasIcon ? 'bg-blue-500' : 'bg-slate-600'}`} 
                           title={entity.hasIcon ? 'Has icon filename' : 'No icon filename'} />
                      
                      {/* Upload Status */}
                      {entity.status === 'pending' && !entity.hasIconId && (
                        <div className="text-amber-300">Pending</div>
                      )}
                      {entity.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
                      )}
                      {entity.status === 'success' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {entity.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-500" title={entity.error} />
                      )}
                      {entity.hasIconId && entity.status !== 'error' && (
                        <CheckCircle className="w-4 h-4 text-green-500" title="Already has icon" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {entities.length > 0 && (
              <div className="p-4 bg-slate-700/50 text-center text-amber-200/60 text-sm border-t border-gold-300/10">
                Showing all {entities.length} entities
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browse Images Tab */}
      {activeSubTab === 'browse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gold-300 animate-spin" />
                <span className="ml-2 text-gold-300">Loading images...</span>
              </div>
            ) : sharedImages.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Image className="w-12 h-12 text-amber-200/40 mx-auto mb-4" />
                <p className="text-amber-200/60">No shared images found</p>
              </div>
            ) : (
              sharedImages.map(image => (
                <div key={image.id} className="group rounded-lg border border-gold-300/20 overflow-hidden"
                     style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
                  <div className="aspect-square bg-slate-800 flex items-center justify-center">
                    <img 
                      src={image.image_url} 
                      alt={image.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="text-amber-200/40 text-sm">Image not found</div>';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-gold-300 truncate">{image.filename}</div>
                    <div className="text-xs text-amber-200/60 mt-1">{image.image_type}</div>
                    <div className="text-xs text-amber-200/40">{(image.file_size / 1024).toFixed(1)} KB</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => window.open(image.image_url, '_blank')}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="View image"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSharedImage(image.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Upload Images Tab */}
      {activeSubTab === 'upload' && (
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-gold-300/20"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
            <h3 className="text-lg font-light text-gold-300 mb-4"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Upload New Images
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">
                  Select Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="w-full p-3 border border-gold-300/30 rounded-lg bg-slate-800/50 text-gold-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-600/20 file:text-gold-300 hover:file:bg-gold-600/30"
                />
              </div>
              
              <button
                onClick={handleFileUpload}
                disabled={uploading || !uploadFiles || uploadFiles.length === 0}
                className="px-6 py-3 bg-gold-600/20 hover:bg-gold-600/30 disabled:bg-gold-600/10 disabled:cursor-not-allowed text-gold-300 border border-gold-300/40 rounded-lg transition-colors flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload {uploadFiles?.length || 0} Files</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedImagesManagement; 