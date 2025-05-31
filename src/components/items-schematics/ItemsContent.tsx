import React, { useState } from 'react';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import { useAuth } from '../auth/AuthProvider';
import { Package, Plus, Search, Filter, TestTube } from 'lucide-react';
import ApiTestingComponent from './ApiTestingComponent';

const ItemsContent: React.FC = () => {
  const { user } = useAuth();
  const [showApiTesting, setShowApiTesting] = useState(false);
  const {
    items,
    categories,
    tiers,
    loading,
    errors,
    refetchItems
  } = useItemsSchematics();

  React.useEffect(() => {
    refetchItems();
  }, [refetchItems]);

  if (loading.items) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (errors.items) {
    return (
      <div className="bg-red-900/20 border border-red-700/30 p-4 text-red-200">
        Error loading items: {errors.items}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span className="text-amber-200 font-medium">
              {items.length} Items
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn btn-outline flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </button>
          
          <button className="btn btn-outline flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>

          <button 
            onClick={() => setShowApiTesting(!showApiTesting)}
            className="btn btn-outline flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            {showApiTesting ? 'Hide' : 'Show'} API Testing
          </button>

          {user && (user.role === 'member' || user.role === 'editor' || user.role === 'admin') && (
            <button className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* API Testing Section */}
      {showApiTesting && (
        <div className="bg-slate-800/30 border border-slate-600/30 p-6">
          <ApiTestingComponent />
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No items found</p>
            <p className="text-slate-500">Items will appear here once they are added to the database.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 border border-slate-600/30 p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-amber-200 font-medium truncate">{item.name}</h3>
                  <div className="flex-shrink-0 ml-2">
                    <span className="text-xs text-slate-400">
                      {item.tier_id ? 'Tier Set' : 'No Tier'}
                    </span>
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Category: {item.category_id || 'None'}</span>
                  <span>Type: {item.type_id || 'None'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ItemsContent; 