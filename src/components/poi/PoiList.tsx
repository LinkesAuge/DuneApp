import React, { useState, useEffect } from 'react';
import { Poi, PoiType } from '../../types';
import { supabase } from '../../lib/supabase';
import { MapPin } from 'lucide-react';
import PoiEditForm from './PoiEditForm';
import PoiCard from './PoiCard';
import GridGallery from '../grid/GridGallery';

interface PoiListProps {
  pois: Poi[];
  poiTypes: PoiType[];
  onDelete: (id: string) => void;
  onUpdate: (poi: Poi) => void;
  onViewScreenshot: () => void;
  onPoiGalleryOpen?: (poi: Poi) => void;
}

interface UserInfo {
  [key: string]: { username: string };
}

const PoiList: React.FC<PoiListProps> = ({ pois, poiTypes, onDelete, onUpdate, onViewScreenshot, onPoiGalleryOpen }) => {
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [gridSquares, setGridSquares] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userIds = [...new Set(pois.map(poi => poi.created_by))];
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (error) throw error;

        const infoMap = data.reduce((acc, user) => {
          acc[user.id] = { username: user.username };
          return acc;
        }, {} as UserInfo);

        setUserInfo(infoMap);
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    if (pois.length > 0) {
      fetchUserInfo();
    }
  }, [pois]);

  useEffect(() => {
    const fetchGridSquares = async () => {
      const gridSquareIds = [...new Set(pois.map(poi => poi.grid_square_id))];
      try {
        const { data, error } = await supabase
          .from('grid_squares')
          .select('id, coordinate')
          .in('id', gridSquareIds);

        if (error) throw error;

        const squareMap = data.reduce((acc, square) => {
          acc[square.id] = square.coordinate;
          return acc;
        }, {} as { [key: string]: string });

        setGridSquares(squareMap);
      } catch (err) {
        console.error('Error fetching grid squares:', err);
      }
    };

    if (pois.length > 0) {
      fetchGridSquares();
    }
  }, [pois]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this POI?')) return;
    
    try {
      const { error } = await supabase
        .from('pois')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onDelete(id);
    } catch (err: any) {
      console.error('Error deleting POI:', err);
      setError(err.message);
    }
  };

  const getPoiType = (poiTypeId: string) => {
    return poiTypes.find(type => type.id === poiTypeId);
  };

  if (pois.length === 0) {
    return (
      <div className="text-center py-8 text-sand-400">
        <MapPin size={36} className="mx-auto mb-2 text-sand-500" />
        <p>No points of interest found in this area</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 text-red-300 rounded-md text-sm border border-red-700/30">
          {error}
        </div>
      )}
      
      {pois.map(poi => {
        if (editingPoiId === poi.id) {
          return (
            <PoiEditForm 
              key={poi.id}
              poi={poi}
              poiTypes={poiTypes}
              onCancel={() => setEditingPoiId(null)}
              onUpdate={(updatedPoi) => {
                onUpdate(updatedPoi);
                setEditingPoiId(null);
              }}
            />
          );
        }

        return (
          <PoiCard
            key={poi.id}
            poi={poi}
            poiType={getPoiType(poi.poi_type_id)}
            gridSquareCoordinate={gridSquares[poi.grid_square_id]}
            creator={userInfo[poi.created_by]}
            onEdit={() => setEditingPoiId(poi.id)}
            onDelete={() => handleDelete(poi.id)}
            onImageClick={() => onPoiGalleryOpen?.(poi)}
          />
        );
      })}
    </div>
  );
};

export default PoiList;