import React, { useMemo, useCallback, forwardRef } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { cn } from '../../lib/utils';

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight?: number | ((index: number) => number);
  height: number;
  width?: number | string;
  className?: string;
  itemClassName?: string;
  renderItem: (props: { item: T; index: number; style: React.CSSProperties; isScrolling?: boolean }) => React.ReactNode;
  getItemKey?: (index: number, item: T) => string | number;
  overscanCount?: number;
  threshold?: number; // Minimum items to enable virtualization
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  scrollToIndex?: number;
  scrollToAlignment?: 'auto' | 'smart' | 'center' | 'end' | 'start';
}

export function VirtualizedList<T>({
  items,
  itemHeight = 60,
  height,
  width = '100%',
  className,
  itemClassName,
  renderItem,
  getItemKey,
  overscanCount = 5,
  threshold = 100,
  onScroll,
  scrollToIndex,
  scrollToAlignment = 'auto'
}: VirtualizedListProps<T>) {
  // Don't virtualize if below threshold
  const shouldVirtualize = items.length >= threshold;

  const itemCount = items.length;
  const isVariableHeight = typeof itemHeight === 'function';

  // Item renderer for react-window
  const VirtualizedItem = useCallback(({ index, style, isScrolling }: {
    index: number;
    style: React.CSSProperties;
    isScrolling?: boolean;
  }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div
        style={style}
        className={cn(
          "flex items-center",
          itemClassName
        )}
      >
        {renderItem({ item, index, style, isScrolling })}
      </div>
    );
  }, [items, renderItem, itemClassName]);

  // Key extractor
  const itemKey = useCallback((index: number) => {
    const item = items[index];
    if (getItemKey) {
      return getItemKey(index, item);
    }
    return index;
  }, [items, getItemKey]);

  // Handle scroll events
  const handleScroll = useCallback(({ scrollTop, scrollLeft }: { scrollTop: number; scrollLeft: number }) => {
    onScroll?.(scrollTop, scrollLeft);
  }, [onScroll]);

  // Memoize list props to prevent unnecessary re-renders
  const listProps = useMemo(() => ({
    itemCount,
    height,
    width,
    overscanCount,
    onScroll: handleScroll,
    ...(scrollToIndex !== undefined && {
      scrollToIndex,
      scrollToAlignment
    })
  }), [itemCount, height, width, overscanCount, handleScroll, scrollToIndex, scrollToAlignment]);

  // If we shouldn't virtualize, render normally
  if (!shouldVirtualize) {
    return (
      <div 
        className={cn("overflow-auto", className)}
        style={{ height, width }}
      >
        <div className="space-y-1">
          {items.map((item, index) => {
            const key = getItemKey ? getItemKey(index, item) : index;
            return (
              <div
                key={key}
                className={cn("flex items-center", itemClassName)}
                style={{ height: typeof itemHeight === 'number' ? itemHeight : undefined }}
              >
                {renderItem({ 
                  item, 
                  index, 
                  style: { height: typeof itemHeight === 'number' ? itemHeight : 'auto' }
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Variable height list
  if (isVariableHeight) {
    const getItemSize = itemHeight as (index: number) => number;
    
    return (
      <div className={className}>
        <VariableSizeList
          {...listProps}
          itemSize={getItemSize}
          itemKey={itemKey}
        >
          {VirtualizedItem}
        </VariableSizeList>
      </div>
    );
  }

  // Fixed height list
  return (
    <div className={className}>
      <List
        {...listProps}
        itemSize={itemHeight as number}
        itemKey={itemKey}
      >
        {VirtualizedItem}
      </List>
    </div>
  );
}

// Performance-optimized item wrapper
export const VirtualizedItemWrapper = forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}>(({ children, className, style, onClick, onMouseEnter, onMouseLeave }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center w-full",
        onClick && "cursor-pointer",
        className
      )}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
});

VirtualizedItemWrapper.displayName = 'VirtualizedItemWrapper';

export default VirtualizedList; 