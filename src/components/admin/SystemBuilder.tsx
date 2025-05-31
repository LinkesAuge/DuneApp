import React, { useState } from 'react';
import SystemBuilderLayout, { SystemBuilderTab } from './SystemBuilderLayout';
import CategoryManager from './CategoryManager';
import TypeManager from './TypeManager';
import FieldDefinitionManager from './FieldDefinitionManager';
import TierManager from './TierManager';
import DefaultAssignmentManager from './DefaultAssignmentManager';

interface SystemBuilderProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const SystemBuilder: React.FC<SystemBuilderProps> = ({
  onError,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<SystemBuilderTab>('categories');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <CategoryManager />
        );
      case 'types':
        return (
          <TypeManager />
        );
      case 'fields':
        return (
          <FieldDefinitionManager
            onError={onError}
            onSuccess={onSuccess}
          />
        );
      case 'tiers':
        return (
          <TierManager
            onError={onError}
            onSuccess={onSuccess}
          />
        );
      case 'defaults':
        return (
          <DefaultAssignmentManager
            onError={onError}
            onSuccess={onSuccess}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-amber-200/70 text-lg font-light tracking-wide"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              System Builder interface is under development
            </p>
            <p className="text-amber-200/50 text-sm mt-2"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              This will provide comprehensive tools for managing the Items & Schematics system
            </p>
          </div>
        );
    }
  };

  return (
    <SystemBuilderLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </SystemBuilderLayout>
  );
};

export default SystemBuilder; 