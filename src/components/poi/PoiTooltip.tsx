import React, { useState, useEffect } from 'react';
import { Package, FileText } from 'lucide-react';
import { getPoiWithItems } from '../../lib/api/poiEntityLinks';
import { PoiWithItems } from '../../types';

interface PoiTooltipProps {
  poiId: string;
  poiName: string;
  poiTypeName: string;
  mapType?: 'hagga_basin' | 'deep_desert';
  coordinate?: string;
  className?: string;
}

const PoiTooltip: React.FC<PoiTooltipProps> = ({
  poiId,
  poiName,
  poiTypeName,
  mapType = 'hagga_basin',
  coordinate,
  className = ''
}) => {
  const [poiWithItems, setPoiWithItems] = useState<PoiWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoiItems = async () => {
      try {
        setLoading(true);
        const data = await getPoiWithItems(poiId);
        setPoiWithItems(data);
      } catch (error) {
        console.error('Error fetching POI items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoiItems();
  }, [poiId]);

  const linkedItems = poiWithItems?.linked_items || [];
  const linkedSchematics = poiWithItems?.linked_schematics || [];
  const hasLinks = linkedItems.length > 0 || linkedSchematics.length > 0;

  return (
    <div className={`bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg max-w-xs ${className}`}>
      {/* POI Header */}
      <div className="mb-3">
        <h3 className="font-medium text-amber-100 text-sm">{poiName}</h3>
        <div className="flex items-center gap-2 text-xs text-amber-200/70">
          <span>{poiTypeName}</span>
          {mapType === 'deep_desert' && coordinate && (
            <>
              <span>•</span>
              <span>Grid {coordinate}</span>
            </>
          )}
          {mapType === 'hagga_basin' && (
            <>
              <span>•</span>
              <span>Hagga Basin</span>
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-2">
          <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Linked Items/Schematics */}
      {!loading && hasLinks && (
        <div className="space-y-2">
          {/* Linked Items */}
          {linkedItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Package className="w-3 h-3 text-green-400" />
                <span className="text-xs font-medium text-green-300">Items ({linkedItems.length})</span>
              </div>
              <div className="space-y-1">
                {linkedItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="text-xs text-amber-200/80">
                    • {item.name}
                  </div>
                ))}
                {linkedItems.length > 3 && (
                  <div className="text-xs text-amber-200/60">
                    +{linkedItems.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Linked Schematics */}
          {linkedSchematics.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium text-blue-300">Schematics ({linkedSchematics.length})</span>
              </div>
              <div className="space-y-1">
                {linkedSchematics.slice(0, 3).map((schematic) => (
                  <div key={schematic.id} className="text-xs text-amber-200/80">
                    • {schematic.name}
                  </div>
                ))}
                {linkedSchematics.length > 3 && (
                  <div className="text-xs text-amber-200/60">
                    +{linkedSchematics.length - 3} more schematics
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Links Message */}
      {!loading && !hasLinks && (
        <div className="text-xs text-amber-200/60 text-center py-1">
          No linked items or schematics
        </div>
      )}
    </div>
  );
};

export default PoiTooltip; 