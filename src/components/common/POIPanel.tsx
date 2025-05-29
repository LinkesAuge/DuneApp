import React, { useState, useMemo } from 'react';
import { Poi, PoiType, CustomIcon, GridSquare } from '../../types';
import { MapPin, LayoutGrid, List, SortAsc, SortDesc, Bookmark, Image as ImageIcon } from 'lucide-react';
import PoiCard from '../poi/PoiCard';
import PoiListItem from '../poi/PoiListItem';
import HaggaBasinPoiCard from '../hagga-basin/HaggaBasinPoiCard';
import HexButton from './HexButton';

interface POIPanelProps {
  pois?: Poi[];
  poiTypes?: PoiType[];
  customIcons?: CustomIcon[];
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedPoiTypes?: string[];
  onPoiTypeToggle?: (typeId: string) => void;
  privacyFilter?: 'all' | 'public' | 'private' | 'shared';
  onPrivacyFilterChange?: (filter: 'all' | 'public' | 'private' | 'shared') => void;
  mapType?: 'deep_desert' | 'hagga_basin';
  // Optional grid squares for Deep Desert
  gridSquares?: GridSquare[];
  // User info for displaying creators
  userInfo?: { [key: string]: { username: string } };
  // Callbacks
  onPoiClick?: (poi: Poi) => void;
  onPoiHighlight?: (poi: Poi) => void;
  onPoiEdit?: (poi: Poi) => void;
  onPoiDelete?: (poiId: string) => Promise<void>;
  onPoiShare?: (poi: Poi) => void;
  onPoiGalleryOpen?: (poi: Poi) => void;
  // Panel settings
  enableSorting?: boolean;
  enableViewToggle?: boolean;
  headerTitle: string;
  headerSubtitle: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePlaceholderIcon?: React.ReactNode;
  description: React.ReactNode;
  bundleTitle?: string;
  bundleItems?: string[];
  className?: string;
  bodyBgColor?: string;
  textColor?: string;
  bundleTitleColor?: string;
  accentColor?: string;
  descriptionBgColor?: string;
  descriptionInlineStyle?: React.CSSProperties;
  bundleBgColor?: string;
  bundleInlineStyle?: React.CSSProperties;
  headerActions?: React.ReactNode[];
  footerContent?: React.ReactNode;
  headerIcon?: React.ReactNode;
  metaInfoText?: string;
  actionsBarContent?: React.ReactNode;
  screenshotCount?: number;
  onImageClick?: () => void;
  panelHeaderHexButtonSize?: 'sm' | 'md' | 'lg';
}

const POIPanel: React.FC<POIPanelProps> = ({
  pois = [],
  poiTypes = [],
  customIcons = [],
  searchTerm = '',
  onSearchChange = () => {},
  selectedPoiTypes = [],
  onPoiTypeToggle = () => {},
  privacyFilter = 'all',
  onPrivacyFilterChange = () => {},
  mapType = 'deep_desert',
  gridSquares,
  userInfo = {},
  onPoiClick,
  onPoiHighlight,
  onPoiEdit,
  onPoiDelete,
  onPoiShare,
  onPoiGalleryOpen,
  enableSorting = true,
  enableViewToggle = true,
  headerTitle,
  headerSubtitle,
  imageUrl,
  imageAlt = 'POI Image',
  imagePlaceholderIcon = <ImageIcon size={48} className="text-slate-500" />,
  description,
  bundleTitle,
  bundleItems,
  className = '',
  bodyBgColor = 'bg-night-900',
  textColor = 'text-sand-200',
  bundleTitleColor = 'text-gold-300',
  accentColor = 'text-gold-400',
  descriptionBgColor,
  descriptionInlineStyle,
  bundleBgColor,
  bundleInlineStyle,
  headerActions,
  footerContent,
  headerIcon,
  metaInfoText,
  actionsBarContent,
  screenshotCount,
  onImageClick,
  panelHeaderHexButtonSize = 'lg',
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
      if (selectedPoiTypes.length > 0 && !selectedPoiTypes.includes(poi.poi_type_id)) {
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
    <div className={`w-full max-w-sm sm:max-w-md rounded-lg shadow-xl border border-slate-700/50 ${className}`}>
      {/* New Header Structure with HexButton */}
      <div className="relative flex items-center justify-between p-2 bg-night-800/50">
        {/* Container for HexButton - centers the button and allows it to grow */}
        <div className="flex-grow min-w-0 overflow-hidden flex justify-center">
          <HexButton 
            variant="primary" 
            size={panelHeaderHexButtonSize} 
            icon={headerIcon}
            className="max-w-full w-full"
          >
            {headerTitle}
          </HexButton>
        </div>
        {headerActions && (
          <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center space-x-1 z-20">
            {headerActions.map((action, index) => (
              <React.Fragment key={index}>{action}</React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`${bodyBgColor} p-5 relative`}>
        {(imageUrl || imagePlaceholderIcon) && (
            <div className="relative w-full h-40 bg-slate-800/60 flex items-center justify-center rounded-md mb-4 border border-slate-700">
                {onImageClick && imageUrl ? (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onImageClick) onImageClick(); 
                    }}
                    className="w-full h-full appearance-none focus:outline-none cursor-pointer"
                  >
                    <img src={imageUrl} alt={imageAlt} className="w-full h-full object-contain rounded-md" />
                  </button>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={imageAlt} className="w-full h-full object-contain rounded-md" />
                ) : (
                    imagePlaceholderIcon
                )}
                {imageUrl && screenshotCount && screenshotCount > 1 && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (onImageClick) onImageClick(); 
                    }}
                    className="absolute bottom-1 right-1 bg-night-950 text-gold-300 text-xs px-1.5 py-0.5 rounded-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
                    title={`View ${screenshotCount -1} more screenshot(s)`}
                  >
                    + {screenshotCount - 1} more
                  </button>
                )}
            </div>
        )}

        <div 
          className={`mb-4 p-3 rounded-md ${descriptionBgColor !== undefined ? descriptionBgColor : 'bg-slate-800/30'} ${textColor} text-sm leading-relaxed`} 
          style={descriptionInlineStyle}
        >
          {description}
        </div>

        {bundleItems && bundleItems.length > 0 && (
          <div className="border-t border-slate-700 pt-4 mt-4">
            <h4 className={`text-sm font-semibold mb-2 ${bundleTitleColor}`}>
              {bundleTitle || 'Contains:'}
            </h4>
            <ul 
              className={`grid grid-cols-2 gap-x-4 p-3 rounded-md ${bundleBgColor !== undefined ? bundleBgColor : 'bg-slate-800/30'}`}
              style={bundleInlineStyle}
            >
              {bundleItems.map((item, index) => (
                <li key={index} className={`${textColor} text-xs flex items-center mb-1`}>
                  <span className={`mr-2 ${accentColor}`}>&bull;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Content Section (Comments) */}
      {footerContent && (
        <div className="border-t border-slate-700 p-4 bg-night-950">
          {footerContent}
        </div>
      )}

      {/* Meta Info Text (Creator/Date) - New Section */}
      {metaInfoText && (
        <div className={`${bodyBgColor} px-5 pb-3 pt-1 text-xs ${textColor} text-center border-t border-slate-700/50`}>
          {metaInfoText}
        </div>
      )}

      {/* Actions Bar - New Section */}
      {actionsBarContent && (
        <div className={`${bodyBgColor} px-5 pb-4 pt-2 border-t border-slate-700 flex items-center justify-around`}>
          {actionsBarContent}
        </div>
      )}
    </div>
  );
};

export default POIPanel; 