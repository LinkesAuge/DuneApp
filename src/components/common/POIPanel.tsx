import React, { useState, useMemo } from 'react';
import { Poi, PoiType, CustomIcon, GridSquare } from '../../types';
import { MapPin, LayoutGrid, List, SortAsc, SortDesc } from 'lucide-react';
import PoiCard from '../poi/PoiCard';
import PoiListItem from '../poi/PoiListItem';
import HaggaBasinPoiCard from '../hagga-basin/HaggaBasinPoiCard';

interface POIPanelProps {
  pois: Poi[];
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedPoiTypes: string[];
  onPoiTypeToggle: (typeId: string) => void;
  privacyFilter: 'all' | 'public' | 'private' | 'shared';
  onPrivacyFilterChange: (filter: 'all' | 'public' | 'private' | 'shared') => void;
  mapType: 'deep_desert' | 'hagga_basin';
  // Optional grid squares for Deep Desert
  gridSquares?: GridSquare[];
  // User info for displaying creators
  userInfo?: { [key: string]: { username: string } };
  // Callbacks
  onPoiClick?: (poi: Poi) => void;
  onPoiEdit?: (poi: Poi) => void;
  onPoiDelete?: (poiId: string) => Promise<void>;
  onPoiShare?: (poi: Poi) => void;
  onPoiGalleryOpen?: (poi: Poi) => void;
  // Panel settings
  enableSorting?: boolean;
  enableViewToggle?: boolean;
}

const POIPanel: React.FC<POIPanelProps> = ({
  pois,
  poiTypes,
  customIcons,
  searchTerm,
  onSearchChange,
  selectedPoiTypes,
  onPoiTypeToggle,
  privacyFilter,
  onPrivacyFilterChange,
  mapType,
  gridSquares,
  userInfo = {},
  onPoiClick,
  onPoiEdit,
  onPoiDelete,
  onPoiShare,
  onPoiGalleryOpen,
  enableSorting = true,
  enableViewToggle = true,
}) => {
  // Display and sorting state
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [sortField, setSortField] = useState<'title' | 'created_at' | 'updated_at' | 'category' | 'type'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter POIs based on current filter state
  const filteredPois = useMemo(() => {
    return pois.filter(poi => {
      // Search term filter
      if (searchTerm && !poi.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(poi.description && poi.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }

      // POI type filter - Show only selected types
      if (!selectedPoiTypes.includes(poi.poi_type_id)) {
        return false;
      }

      // Privacy filter
      if (privacyFilter !== 'all') {
        if (privacyFilter === 'public' && poi.privacy_level !== 'global') {
          return false;
        }
        if (privacyFilter === 'private' && poi.privacy_level !== 'private') {
          return false;
        }
        if (privacyFilter === 'shared' && poi.privacy_level !== 'shared') {
          return false;
        }
      }

      return true;
    });
  }, [pois, searchTerm, selectedPoiTypes, privacyFilter]);

  // Sort filtered POIs
  const sortedPois = useMemo(() => {
    return [...filteredPois].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'category':
          const aType = poiTypes.find(t => t.id === a.poi_type_id);
          const bType = poiTypes.find(t => t.id === b.poi_type_id);
          comparison = (aType?.category || '').localeCompare(bType?.category || '');
          break;
        case 'type':
          const aTypeName = poiTypes.find(t => t.id === a.poi_type_id);
          const bTypeName = poiTypes.find(t => t.id === b.poi_type_id);
          comparison = (aTypeName?.name || '').localeCompare(bTypeName?.name || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredPois, sortField, sortDirection, poiTypes]);

  // Helper function to get POI type
  const getPoiType = (poiTypeId: string) => {
    return poiTypes.find(type => type.id === poiTypeId);
  };

  // Helper function to get grid coordinate for Deep Desert POIs
  const getGridCoordinate = (poi: Poi) => {
    if (mapType === 'hagga_basin') return null;
    if (!gridSquares || !poi.grid_square_id) return null;
    const gridSquare = gridSquares.find(gs => gs.id === poi.grid_square_id);
    return gridSquare?.coordinate;
  };

  // Helper function to check if an icon is a URL
  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
  };

  // Helper function to get display image URL
  const getDisplayImageUrl = (icon: string): string => {
    if (isIconUrl(icon)) {
      return icon;
    }
    return icon; // Return emoji as-is
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Fixed Header - exact same pattern */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sand-900 text-base">POIs</h3>
        <div className="flex items-center gap-2">
          {/* Right side: View Mode Toggle */}
          {enableViewToggle && (
            <div className="flex border border-sand-300 rounded-md">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`p-1.5 transition-colors duration-150 ${displayMode === 'grid' ? 'bg-spice-600 text-white' : 'bg-sand-100 hover:bg-sand-200 text-night-700'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-1.5 transition-colors duration-150 ${displayMode === 'list' ? 'bg-spice-600 text-white' : 'bg-sand-100 hover:bg-sand-200 text-night-700'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Controls - exact same pattern */}
      <div className="mb-4">
        {enableSorting && (
          <div className="flex items-center gap-2">
            <select 
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="select select-sm text-xs flex-1"
            >
              <option value="created_at">Date Created</option>
              <option value="updated_at">Date Updated</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="type">Type</option>
            </select>
            <button 
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="btn btn-sm btn-outline p-1.5"
              title={`Sort direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area - EXACT SAME PATTERN AS WORKING PoiControlPanel */}
      <div className="flex-1 overflow-y-auto">
        {sortedPois.length === 0 ? (
          <div className="text-center py-6 text-sand-600">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-sand-400" />
            <div className="font-medium mb-1">No POIs match current filters</div>
            <div className="text-sm">Try adjusting your search or filters</div>
          </div>
        ) : (
          <div className={`gap-4 ${displayMode === 'grid' ? 'grid grid-cols-1' : 'flex flex-col'}`}>
            {sortedPois.map(poi => {
              const poiType = getPoiType(poi.poi_type_id);
              if (!poiType) return null;

              const gridCoordinate = getGridCoordinate(poi);
              const creator = userInfo[poi.created_by];

              if (displayMode === 'list') {
                return (
                  <PoiListItem
                    key={poi.id}
                    poi={poi}
                    poiType={poiType}
                    gridSquareCoordinate={gridCoordinate}
                    creator={creator}
                    onClick={() => onPoiClick?.(poi)}
                    onImageClick={() => onPoiGalleryOpen?.(poi)}
                    onEdit={() => onPoiEdit?.(poi)}
                    onDelete={() => onPoiDelete?.(poi.id)}
                  />
                );
              }
              
              return (
                <PoiCard
                  key={poi.id}
                  poi={poi}
                  poiType={poiType}
                  customIcons={customIcons}
                  gridSquareCoordinate={gridCoordinate}
                  creator={creator}
                  onClick={() => onPoiClick?.(poi)}
                  onImageClick={() => onPoiGalleryOpen?.(poi)}
                  onEdit={() => onPoiEdit?.(poi)}
                  onDelete={() => onPoiDelete?.(poi.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default POIPanel; 