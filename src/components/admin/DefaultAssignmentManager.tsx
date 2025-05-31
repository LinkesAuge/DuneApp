import React from 'react';
import { Settings, Target } from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';

interface DefaultAssignmentManagerProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const DefaultAssignmentManager: React.FC<DefaultAssignmentManagerProps> = ({
  onError,
  onSuccess
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DiamondIcon
          icon={<Settings size={18} strokeWidth={1.5} />}
          size="md"
          bgColor="bg-void-950"
          actualBorderColor="bg-gold-300"
          borderThickness={2}
          iconColor="text-gold-300"
        />
        <div>
          <h3 className="text-lg font-light text-gold-300"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            DEFAULT ASSIGNMENT RULES
          </h3>
          <p className="text-amber-200/70 text-sm font-light"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Configure automatic POI item/schematic assignments
          </p>
        </div>
      </div>

      {/* Development Status */}
      <div className="relative p-6 rounded-lg border border-amber-200/30 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
        <div className="flex items-center gap-4">
          <DiamondIcon
            icon={<Target size={18} strokeWidth={1.5} />}
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
              Default assignment rules will be implemented in Step 5.1
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-amber-200/70 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-300/60"></div>
            <span>POI type default item/schematic configuration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-300/60"></div>
            <span>Automatic assignment rules with quantity settings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-300/60"></div>
            <span>Retroactive application to existing POIs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-300/60"></div>
            <span>Impact preview and confirmation system</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultAssignmentManager; 