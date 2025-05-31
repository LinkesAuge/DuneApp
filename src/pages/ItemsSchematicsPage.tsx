import React, { useState } from 'react';
import ItemsSchematicsLayout from '../components/items-schematics/ItemsSchematicsLayout';
import ItemsContent from '../components/items-schematics/ItemsContent';
import SchematicsContent from '../components/items-schematics/SchematicsContent';
import { Package, FileText } from 'lucide-react';

const ItemsSchematicsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'schematics'>('items');

  const TabButton: React.FC<{
    tab: 'items' | 'schematics';
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ tab, icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-6 py-3 font-medium text-sm tracking-wide transition-all duration-300
        ${isActive 
          ? 'text-amber-200 bg-slate-800/50 border-b-2 border-amber-400' 
          : 'text-slate-400 hover:text-amber-300 bg-slate-900/30 hover:bg-slate-800/30'
        }
      `}
    >
      <span className={`transition-colors duration-300 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
        {icon}
      </span>
      {label}
      
      {/* Active tab indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-md shadow-amber-400/50" />
      )}
    </button>
  );

  return (
    <ItemsSchematicsLayout 
      title="Items & Schematics Database"
      subtitle="Manage and explore all items and crafting schematics in the Dune universe"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-slate-600/30">
          <div className="flex">
            <TabButton
              tab="items"
              icon={<Package className="w-4 h-4" />}
              label="Items"
              isActive={activeTab === 'items'}
              onClick={() => setActiveTab('items')}
            />
            <TabButton
              tab="schematics"
              icon={<FileText className="w-4 h-4" />}
              label="Schematics"
              isActive={activeTab === 'schematics'}
              onClick={() => setActiveTab('schematics')}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'items' ? (
            <ItemsContent />
          ) : (
            <SchematicsContent />
          )}
        </div>
      </div>
    </ItemsSchematicsLayout>
  );
};

export default ItemsSchematicsPage; 