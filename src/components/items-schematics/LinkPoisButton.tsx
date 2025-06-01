import React from 'react';
import { useNavigate } from 'react-router-dom';
import LinkingButton from './LinkingButton';
import type { ItemWithRelations, SchematicWithRelations } from '../../types';

interface LinkPoisButtonProps {
  entity: ItemWithRelations | SchematicWithRelations;
  entityType: 'item' | 'schematic';
  onLinksUpdated?: () => void;
  disabled?: boolean;
}

const LinkPoisButton: React.FC<LinkPoisButtonProps> = ({ 
  entity, 
  entityType, 
  disabled = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Convert 'item' -> 'items' and 'schematic' -> 'schematics' for the route
    const pluralType = entityType === 'item' ? 'items' : 'schematics';
    const route = `/${pluralType}/${entity.id}/link-pois`;
    navigate(route);
  };

  return (
    <LinkingButton
      direction="to_pois"
      onClick={handleClick}
      disabled={disabled}
    />
  );
};

export default LinkPoisButton; 