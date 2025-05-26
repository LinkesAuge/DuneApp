// User related types
export type UserRole = 'admin' | 'editor' | 'member' | 'pending';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

// Grid related types
export interface GridSquare {
  id: string;
  coordinate: string;
  screenshot_url: string | null;
  is_explored: boolean;
  uploaded_by: string | null;
  upload_date: string;
}

// POI related types
export interface PoiType {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  default_description: string | null;
  icon_has_transparent_background?: boolean;
}

export interface PoiScreenshot {
  id: string;
  url: string;
  uploaded_by: string;
  upload_date: string;
}

export interface Poi {
  id: string;
  grid_square_id: string;
  poi_type_id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  screenshots: PoiScreenshot[];
}

export interface PoiWithGridSquare extends Poi {
  grid_square?: GridSquare;
}

// Generic types
export interface Coordinate {
  x: number;
  y: number;
  label: string;
}

// Auth state
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Application state
export interface AppState {
  gridSquares: GridSquare[];
  selectedGridSquare: GridSquare | null;
  pois: Poi[];
  poiTypes: PoiType[];
  isLoading: boolean;
  error: string | null;
}

// Admin Panel Specific Types
export interface ScheduledAdminTask {
  jobId: number;
  jobName: string;
  taskType: 'backup' | 'reset' | 'unknown';
  frequency: 'daily' | 'weekly' | 'custom' | 'unknown';
  time: string; // HH:MM
  dayOfWeek?: number; // 0-6 for weekly, undefined for daily
  isActive: boolean;
  fullCronExpression: string;
  rawCommand: string;
  // nextRun?: string; // Could be string if pre-formatted, or Date if to be formatted in frontend
}