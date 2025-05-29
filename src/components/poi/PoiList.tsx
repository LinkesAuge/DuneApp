import React, { useState, useMemo } from 'react';
import { Poi, PoiType, CustomIcon, GridSquare } from '../../types';
import { MapPin, LayoutGrid, List, SortAsc, SortDesc } from 'lucide-react';
import PoiCard from '../poi/PoiCard';
import PoiListItem from '../poi/PoiListItem';
import { UserInfo } from '../../types';

interface POIListProps {
  pois: Poi[];
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
  gridSquares: GridSquare[];
  userInfo: Record<string, UserInfo>;
  onPoiClick?: (poi: Poi) => void; // For map centering, etc.
  onPoiHighlight?: (poi: Poi) => void;
  onPoiEdit?: (poi: Poi) => void;
  onPoiDelete?: (id: string) => void;
  onPoiGalleryOpen?: (poi: Poi) => void;
  defaultDisplayMode?: 'grid' | 'list';
  enableSorting?: boolean;
  enableViewToggle?: boolean;
}

const POIList: React.FC<POIListProps> = ({
  pois,
  poiTypes,
  customIcons,
  gridSquares,
  userInfo,
  onPoiClick,
  onPoiHighlight,
  onPoiEdit,
  onPoiDelete,
  onPoiGalleryOpen,
  defaultDisplayMode = 'grid',
  enableSorting = true,
  enableViewToggle = true,
}) => {
  // Display and sorting state
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>(defaultDisplayMode);
  const [sortField, setSortField] = useState<keyof Poi | 'category' | 'type'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getPoiType = (typeId: string) => poiTypes.find(pt => pt.id === typeId);
  const getGridCoordinate = (poi: Poi) => {
    const gridSquare = gridSquares.find(gs => gs.id === poi.grid_square_id);
    return gridSquare ? gridSquare.coordinate : 'N/A';
  };

  const sortedPois = useMemo(() => {
    return [...pois].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'category') {
        valA = getPoiType(a.poi_type_id)?.category || '';
        valB = getPoiType(b.poi_type_id)?.category || '';
      } else if (sortField === 'type') {
        valA = getPoiType(a.poi_type_id)?.name || '';
        valB = getPoiType(b.poi_type_id)?.name || '';
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      // Fallback for other types or mixed types (e.g., nulls)
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [pois, sortField, sortDirection, poiTypes]);
  
  const getDisplayIcon = (icon: string | null | undefined) => {
    if (!icon) return <MapPin className="w-4 h-4 text-sand-500" />;
    if (icon.startsWith('http') || icon.startsWith('/')) {
      return <img src={icon} alt="icon" className="w-4 h-4 object-contain" />;
    }
    return icon; // Return emoji as-is
  };

  return (
    <div className="h-full flex flex-col p-4 bg-sand-50 rounded-lg shadow">
      {/* Fixed Header - exact same pattern */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-night-700 text-base">POIs ({sortedPois.length})</h3>
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
              className="w-full px-3 py-2 border border-sand-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-spice-500 bg-white text-night-700 placeholder-sand-500"
            >
              <option value="created_at">Date Created</option>
              <option value="updated_at">Date Updated</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="type">Type</option>
            </select>
            <button 
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-sand-300 rounded-md hover:bg-sand-200 transition-colors text-night-700"
              title={`Sort direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortDirection === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area - EXACT SAME PATTERN AS WORKING PoiControlPanel */}
      <div className="flex-1 overflow-y-auto pr-1">
        {sortedPois.length === 0 ? (
          <div className="text-center py-10 text-sand-600">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-sand-400" />
            <div className="font-medium mb-1 text-sand-700">No POIs Found</div>
            <div className="text-sm">Try adjusting your search or filter criteria.</div>
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
                    customIcons={customIcons}
                    gridSquareCoordinate={gridCoordinate}
                    creator={creator}
                    onClick={() => {
                      console.log('POIList: PoiListItem clicked for POI:', poi.title);
                      onPoiClick?.(poi); // Use onPoiClick for general interaction
                      onPoiHighlight?.(poi); // Specifically for highlighting
                    }}
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
                  onClick={() => {
                    console.log('POIList: PoiCard clicked for POI:', poi.title);
                    onPoiClick?.(poi); // Use onPoiClick for general interaction
                    onPoiHighlight?.(poi); // Specifically for highlighting
                  }}
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

export default POIList;