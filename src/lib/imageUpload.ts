import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadOptions {
  bucket: string;
  folder: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: Partial<UploadOptions> = {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};

export const uploadImage = async (
  file: File, 
  options: UploadOptions
): Promise<UploadResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate file size
  if (opts.maxSizeBytes && file.size > opts.maxSizeBytes) {
    throw new Error(`File size must be less than ${(opts.maxSizeBytes / (1024 * 1024)).toFixed(1)}MB`);
  }

  // Validate file type
  if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${options.folder}/${fileName}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from(options.bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error('Failed to upload image');
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    path: filePath
  };
};

export const deleteImage = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error('Failed to delete image');
  }
};

export const extractPathFromUrl = (url: string, bucket: string): string => {
  // Extract path from Supabase storage URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
  const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) {
    throw new Error('Invalid storage URL format');
  }
  return urlParts[1];
}; 