import { createClient } from '@supabase/supabase-js';

// Suppress development warnings in development
if (process.env.NODE_ENV === 'development') {
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('__cf_bm') && message.includes('ungültiger Domain')) {
      // Suppress Cloudflare bot management cookie warnings in development
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('OpaqueResponseBlocking') || 
        (message.includes('blocked') && message.includes('.webp'))) {
      // Suppress Supabase storage CORS warnings in development
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
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
    // Supabase storage client initialized and accessible
  } catch (error) {
    console.error('Error accessing Supabase storage buckets:', error);
  }
};

// Initialize storage on client creation
initializeStorage();