import React from 'react';
import { Package, FileText, Calendar, User, Tag, Edit, Trash, Star, Share, X } from 'lucide-react';

// Import types
type ActiveView = 'items' | 'schematics';

interface Entity {
  id: string;
  name: string;
  description?: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
  type?: {
    id: string;
    name: string;
  };
  tier?: {
    id: string;
    name: string;
    level: number;
    color?: string;
  };
  icon_url?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  field_values?: Record<string, any>;
}

interface DetailsPanelProps {
  activeView: ActiveView;
  selectedItem: Entity | null;
  onClose?: () => void;
}

const TierBadge: React.FC<{ tier: Entity['tier'] }> = ({ tier }) => {
  if (!tier) return null;

  return (
    <span 
      className="inline-flex items-center px-2 py-1 text-xs font-light rounded-full tracking-wide"
      style={{ 
        backgroundColor: tier.color ? `${tier.color}30` : 'rgba(251, 191, 36, 0.2)',
        color: tier.color || '#f59e0b',
        fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
      }}
    >
      {tier.name}
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
    <h3 className="text-lg font-light text-gold-300 mb-2 tracking-wide"
        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
      No {activeView === 'items' ? 'Item' : 'Schematic'} Selected
    </h3>
    <p className="text-amber-200/70 text-sm font-light"
       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
      Select {activeView === 'items' ? 'an item' : 'a schematic'} from the list to view its details here.
    </p>
  </div>
);

const EntityActions: React.FC<{ entity: Entity }> = ({ entity }) => {
  const permissions = {
    canEdit: true, // TODO: Implement real permissions
    canDelete: true, // TODO: Implement real permissions
  };

  const handleEdit = () => {
    // TODO: Implement edit modal
    console.log('Edit entity:', entity);
  };

  const handleDelete = () => {
    // TODO: Implement delete confirmation
    console.log('Delete entity:', entity);
  };

  const handleFavorite = () => {
    // TODO: Implement favorites
    console.log('Favorite entity:', entity);
  };

  const handleShare = () => {
    // TODO: Implement sharing
    console.log('Share entity:', entity);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFavorite}
        className="p-2 text-amber-200/70 hover:text-gold-300 hover:bg-gold-300/20 rounded-lg transition-colors"
        title="Add to Favorites"
      >
        <Star className="w-4 h-4" />
      </button>
      
      <button
        onClick={handleShare}
        className="p-2 text-amber-200/70 hover:text-gold-300 hover:bg-gold-300/20 rounded-lg transition-colors"
        title="Share"
      >
        <Share className="w-4 h-4" />
      </button>

      {permissions.canEdit && (
        <button
          onClick={handleEdit}
          className="p-2 text-amber-200/70 hover:text-gold-300 hover:bg-gold-300/20 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}

      {permissions.canDelete && (
        <button
          onClick={handleDelete}
          className="p-2 text-amber-200/70 hover:text-red-300 hover:bg-red-300/20 rounded-lg transition-colors"
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
    return <EmptyDetailsPanel activeView={activeView} />;
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-amber-400/20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-light text-amber-200 tracking-wide"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Details
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Details Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

        {/* Category & Type Information */}
        <DetailSection title="Classification">
          <div className="space-y-4">
            {selectedItem.category && (
              <DetailRow
                label="Category"
                value={
                  <div className="flex items-center gap-2">
                    {selectedItem.category.icon && (
                      <span>{selectedItem.category.icon}</span>
                    )}
                    {selectedItem.category.name}
                  </div>
                }
                icon={<Tag className="w-4 h-4" />}
              />
            )}

            {selectedItem.type && (
              <DetailRow
                label="Type"
                value={selectedItem.type.name}
                icon={<Tag className="w-4 h-4" />}
              />
            )}

            {selectedItem.tier && (
              <DetailRow
                label="Tier"
                value={<TierBadge tier={selectedItem.tier} />}
                icon={<Tag className="w-4 h-4" />}
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

        {/* Additional Actions */}
        <DetailSection title="Actions">
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-amber-200/70 hover:text-gold-300 hover:bg-gold-300/20 rounded-lg transition-colors font-light"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              View Full History
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-amber-200/70 hover:text-gold-300 hover:bg-gold-300/20 rounded-lg transition-colors font-light"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Export Data
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-amber-200/70 hover:text-gold-300 hover:bg-gold-300/20 rounded-lg transition-colors font-light"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Report Issue
            </button>
          </div>
        </DetailSection>
      </div>
    </div>
  );
};

export default DetailsPanel; 