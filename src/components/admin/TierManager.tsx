import React from 'react';
import { Target, Settings } from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';

interface TierManagerProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const TierManager: React.FC<TierManagerProps> = ({
  onError,
  onSuccess
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DiamondIcon
          icon={<Target size={18} strokeWidth={1.5} />}
          size="md"
          bgColor="bg-void-950"
          actualBorderColor="bg-gold-300"
          borderThickness={2}
          iconColor="text-gold-300"
        />
        <div>
          <h3 className="text-lg font-light text-gold-300"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            TIER MANAGEMENT
          </h3>
          <p className="text-amber-200/70 text-sm font-light"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Configure technology tier levels and progression
          </p>
        </div>
      </div>

      {/* Development Status */}
      <div className="relative p-6 rounded-lg border border-amber-200/30 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
        <div className="flex items-center gap-4">
          <DiamondIcon
            icon={<Settings size={18} strokeWidth={1.5} />}
            size="md"
            bgColor="bg-amber-900"
            actualBorderColor="bg-amber-300"
            borderThickness={2}
            iconColor="text-amber-300"
          />
          <div>
            <h4 className="text-lg font-light text-amber-300 mb-1"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              UNDER DEVELOPMENT
            </h4>
            <p className="text-amber-200/80 text-sm font-light"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Tier management will be implemented in Step 4.1
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-amber-200/70 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-300/60"></div>
            <span>Drag-and-drop tier level reordering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-300/60"></div>
            <span>Color picker for tier visualization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-300/60"></div>
            <span>Level validation (no gaps, no duplicates)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-300/60"></div>
            <span>Usage statistics and tier migration tools</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierManager; 