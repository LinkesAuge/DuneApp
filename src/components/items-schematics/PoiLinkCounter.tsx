import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PoiLinkCounterProps {
  entityId: string;
  entityType: 'item' | 'schematic';
  className?: string;
}

const PoiLinkCounter: React.FC<PoiLinkCounterProps> = ({ 
  entityId, 
  entityType, 
  className = '' 
}) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkCount = async () => {
      try {
        const { count, error } = await supabase
          .from('poi_entity_links')
          .select('*', { count: 'exact' })
          .eq('entity_id', entityId);

        if (error) throw error;
        setCount(count || 0);
      } catch (error) {
        console.error('Error fetching POI link count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkCount();
  }, [entityId, entityType]);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (count === 0) {
    return null; // Don't show counter if no links
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className="text-xs font-medium text-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-400/30">
        {count}
      </span>
    </div>
  );
};

export default PoiLinkCounter; 