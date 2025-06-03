import React from 'react';
import { Package, FileText, Calendar, User, Tag, Edit, Trash, Star, Share, X } from 'lucide-react';
import EntityPOILinksSection from '../poi-linking/EntityPOILinksSection';

// Import types
type ActiveView = 'items' | 'schematics';

// Use the unified EntityWithRelations interface from types
import { EntityWithRelations } from '../../types/unified-entities';

interface DetailsPanelProps {
  activeView: ActiveView;
  selectedItem: EntityWithRelations | null;
  onClose?: () => void;
}

const TierBadge: React.FC<{ tierNumber: number }> = ({ tierNumber }) => {
  if (tierNumber === undefined || tierNumber === null) return null;

  return (
    <span 
      className="inline-flex items-center px-2 py-1 text-xs font-light rounded-full tracking-wide bg-amber-600/70 text-amber-200"
      style={{ 
        fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
      }}
    >
      Tier {tierNumber}
    </span>
  );
};

const DetailSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="font-light text-amber-200 text-sm uppercase tracking-[0.15em]"
        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
      {title}
    </h3>
    {children}
  </div>
);

const DetailRow: React.FC<{
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    {icon && (
      <div className="mt-0.5 text-amber-200/70">
        {icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <dt className="text-sm font-light text-amber-200/70 tracking-wide"
          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        {label}
      </dt>
      <dd className="text-sm text-amber-200 mt-1 font-light"
          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        {value}
      </dd>
    </div>
  </div>
);

const EmptyDetailsPanel: React.FC<{ activeView: ActiveView }> = ({ activeView }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    {activeView === 'items' ? (
      <Package className="w-16 h-16 text-amber-200/40 mb-4" />
    ) : (
      <FileText className="w-16 h-16 text-amber-200/40 mb-4" />
    )}
    <h3 className="text-lg font-light text-amber-300 mb-2 tracking-wide"
        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
      No {activeView === 'items' ? 'Item' : 'Schematic'} Selected
    </h3>
    <p className="text-amber-200/70 text-sm font-light"
       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
      Select {activeView === 'items' ? 'an item' : 'a schematic'} from the list to view its details here.
    </p>
  </div>
);

const EntityActions: React.FC<{ entity: EntityWithRelations }> = ({ entity }) => {
  const permissions = {
    canEdit: true, // TODO: Implement real permissions
    canDelete: true, // TODO: Implement real permissions
  };

  const handleEdit = () => {
    // TODO: Implement edit modal
  };

  const handleDelete = () => {
    // TODO: Implement delete confirmation
  };

  const handleFavorite = () => {
    // TODO: Implement favorites
  };

  const handleShare = () => {
    // TODO: Implement sharing
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFavorite}
        className="p-2 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
        title="Add to Favorites"
      >
        <Star className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleShare}
        className="p-2 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
        title="Share"
      >
        <Share className="w-4 h-4" />
      </button>

      {permissions.canEdit && (
        <button
          onClick={handleEdit}
          className="p-2 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}

      {permissions.canDelete && (
        <button
          onClick={handleDelete}
          className="p-2 text-amber-200/70 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const DetailsPanel: React.FC<DetailsPanelProps> = ({
  activeView,
  selectedItem,
  onClose
}) => {
  if (!selectedItem) {
    return (
      <div className="group relative h-full">
        {/* Multi-layer background for Dune aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
        
        <div className="relative h-full bg-slate-900 border-l border-amber-400/20">
          <EmptyDetailsPanel activeView={activeView} />
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="group relative h-full">
      {/* Multi-layer background for Dune aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
      
      <div className="relative h-full bg-slate-900 border-l border-amber-400/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-400/20">
          <h2 className="text-lg font-bold text-amber-200 tracking-wide"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Details
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded p-1 transition-colors"
              title="Close Details Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Entity Header */}
        <div className="p-4 border-b border-amber-400/20">
          <div className="flex items-start gap-4">
            {/* Entity Icon */}
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
              {selectedItem.icon_url ? (
                <img 
                  src={selectedItem.icon_url} 
                  alt={selectedItem.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                activeView === 'items' ? (
                  <Package className="w-6 h-6 text-amber-400" />
                ) : (
                  <FileText className="w-6 h-6 text-amber-400" />
                )
              )}
            </div>
            
            {/* Entity Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-amber-200 mb-1"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {selectedItem.name}
              </h3>
              {selectedItem.description && (
                <p className="text-sm text-amber-200/70 font-light leading-relaxed"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {selectedItem.description}
                </p>
              )}
              
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {selectedItem.category && (
                  <span className="px-2 py-0.5 text-xs bg-slate-700 text-amber-300 rounded">
                    {selectedItem.category.name}
                  </span>
                )}
                {selectedItem.type && (
                  <span className="px-2 py-0.5 text-xs bg-blue-600/70 text-blue-200 rounded">
                    {selectedItem.type.name}
                  </span>
                )}
                {selectedItem.tier_number !== undefined && <TierBadge tierNumber={selectedItem.tier_number} />}
              </div>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Information */}
          <DetailSection title="Information">
            <div className="space-y-4">
              <DetailRow
                label="Created"
                value={formatDate(selectedItem.created_at)}
                icon={<Calendar className="w-4 h-4" />}
              />
              
              {selectedItem.updated_at && selectedItem.updated_at !== selectedItem.created_at && (
                <DetailRow
                  label="Last Updated"
                  value={formatDate(selectedItem.updated_at)}
                  icon={<Calendar className="w-4 h-4" />}
                />
              )}

              {selectedItem.created_by && (
                <DetailRow
                  label="Created By"
                  value={selectedItem.created_by}
                  icon={<User className="w-4 h-4" />}
                />
              )}
            </div>
          </DetailSection>

          {/* Dynamic Fields */}
          {selectedItem.field_values && Object.keys(selectedItem.field_values).length > 0 && (
            <DetailSection title="Properties">
              <div className="space-y-4">
                {Object.entries(selectedItem.field_values).map(([key, value]) => (
                  <DetailRow
                    key={key}
                    label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    value={String(value)}
                  />
                ))}
              </div>
            </DetailSection>
          )}

          {/* Entity Actions */}
          <DetailSection title="Actions">
            <div className="space-y-2">
              <EntityActions entity={selectedItem} />
              
              <div className="pt-2 border-t border-amber-400/10">
                <button className="w-full text-left px-3 py-2 text-sm text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors font-light"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  View Full History
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors font-light"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Export Data
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors font-light"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Report Issue
                </button>
              </div>
            </div>
          </DetailSection>

          {/* POI Locations Section */}
          <EntityPOILinksSection
            entity={selectedItem}
            className="mt-6"
            showLinkButton={true}
            canEdit={true}
            onLinksChanged={() => {
              // Could trigger entity data refresh if needed
              // For now, the section handles its own data refresh
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel; 