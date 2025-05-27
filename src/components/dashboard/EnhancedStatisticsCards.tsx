import React from 'react';
import RegionalStatsPanel from './RegionalStatsPanel';
import GeneralStatsPanel from './GeneralStatsPanel';

const EnhancedStatisticsCards: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* Community Overview - Full Width */}
      <GeneralStatsPanel />

      {/* Regional Panels - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Hagga Basin Column */}
        <RegionalStatsPanel
          region="hagga_basin"
          title="Hagga Basin"
          theme="basin"
        />

        {/* Deep Desert Column */}
        <RegionalStatsPanel
          region="deep_desert"
          title="Deep Desert"
          theme="desert"
        />
      </div>
    </div>
  );
};

export default EnhancedStatisticsCards; 