import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with storage configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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