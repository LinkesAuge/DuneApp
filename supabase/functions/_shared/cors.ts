export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or your specific frontend origin e.g. 'http://localhost:5173'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Add all methods you use
}; 