import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for production
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'missing',
  keyPreview: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'missing'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with storage configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js',
    },
  },
});

// Test storage access
try {
  if (supabase.storage) {
    // Removed: console.log("Supabase storage client initialized and accessible.");
  } else {
    console.error("Supabase storage client is not accessible.");
  }
} catch (error) {
  console.error("Error accessing Supabase storage:", error);
}

// Initialize storage bucket if it doesn't exist
export const initializeStorage = async () => {
  try {
    // const { data: buckets } = await supabase.storage.listBuckets(); // No longer needed
    // const poiIconsBucket = buckets?.find(b => b.name === 'poi-icons'); // No longer needed
    
    // if (!poiIconsBucket) { // No longer needed
      // Instead of creating the bucket (which requires admin privileges),
      // we'll just log a message since bucket creation should be handled
      // during project setup by an administrator
      // console.log('POI icons bucket not found. Please ensure it is created by an administrator.'); // No longer needed
    // }
    // Minimal check to ensure storage is generally accessible if needed in future, 
    // or this function can be removed if no other initialization is required.
    await supabase.storage.listBuckets(); 
    console.log("Supabase storage client initialized and accessible.");
  } catch (error) {
    console.error('Error accessing Supabase storage buckets:', error);
  }
};

// Initialize storage on client creation
initializeStorage();