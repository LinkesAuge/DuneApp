import React, { useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid, VariableSizeGrid } from 'react-window';
import { cn } from '../../lib/utils';

export interface VirtualizedGridProps<T> {
  items: T[];
  columnsCount: number;
  itemWidth?: number | ((columnIndex: number) => number);
  itemHeight?: number | ((rowIndex: number) => number);
  height: number;
  width?: number | string;
  className?: string;
  itemClassName?: string;
  renderItem: (props: { 
    item: T | null; 
    rowIndex: number; 
    columnIndex: number; 
    style: React.CSSProperties; 
    isScrolling?: boolean;
  }) => React.ReactNode;
  getItemKey?: (index: number, item: T | null) => string | number;
  overscanCount?: number;
  threshold?: number; // Minimum items to enable virtualization
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  scrollToRow?: number;
  scrollToColumn?: number;
  scrollToAlignment?: 'auto' | 'smart' | 'center' | 'end' | 'start';
  gap?: number;
}

export function VirtualizedGrid<T>({
  items,
  columnsCount,
  itemWidth = 200,
  itemHeight = 200,
  height,
  width = '100%',
  className,
  itemClassName,
  renderItem,
  getItemKey,
  overscanCount = 2,
  threshold = 100,
  onScroll,
  scrollToRow,
  scrollToColumn,
  scrollToAlignment = 'auto',
  gap = 8
}: VirtualizedGridProps<T>) {
  // Don't virtualize if below threshold
  const shouldVirtualize = items.length >= threshold;

  const rowCount = Math.ceil(items.length / columnsCount);
  const isVariableWidth = typeof itemWidth === 'function';
  const isVariableHeight = typeof itemHeight === 'function';

  // Get item at grid position
  const getItemAtPosition = useCallback((rowIndex: number, columnIndex: number): T | null => {
    const itemIndex = rowIndex * columnsCount + columnIndex;
    return items[itemIndex] || null;
  }, [items, columnsCount]);

  // Grid item renderer for react-window
  const GridItem = useCallback(({ 
    rowIndex, 
    columnIndex, 
    style, 
    isScrolling 
  }: {
    rowIndex: number;
    columnIndex: number;
    style: React.CSSProperties;
    isScrolling?: boolean;
  }) => {
    const item = getItemAtPosition(rowIndex, columnIndex);
    
    // Don't render empty cells
    if (!item) {
      return <div style={style} />;
    }

    // Apply gap to style
    const adjustedStyle = {
      ...style,
      left: (style.left as number) + gap,
      top: (style.top as number) + gap,
      width: (style.width as number) - gap,
      height: (style.height as number) - gap,
    };

    return (
      <div
        style={adjustedStyle}
        className={cn(
          "flex items-center justify-center",
          itemClassName
        )}
      >
        {renderItem({ item, rowIndex, columnIndex, style: adjustedStyle, isScrolling })}
      </div>
    );
  }, [getItemAtPosition, renderItem, itemClassName, gap]);

  // Key extractor for grid items
  const itemKey = useCallback(({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) => {
    const item = getItemAtPosition(rowIndex, columnIndex);
    const itemIndex = rowIndex * columnsCount + columnIndex;
    
    if (getItemKey && item) {
      return getItemKey(itemIndex, item);
    }
    return `${rowIndex}-${columnIndex}`;
  }, [getItemAtPosition, getItemKey, columnsCount]);

  // Handle scroll events
  const handleScroll = useCallback(({ scrollTop, scrollLeft }: { scrollTop: number; scrollLeft: number }) => {
    onScroll?.(scrollTop, scrollLeft);
  }, [onScroll]);

  // Memoize grid props to prevent unnecessary re-renders
  const gridProps = useMemo(() => ({
    rowCount,
    columnCount: columnsCount,
    height,
    width,
    overscanRowCount: overscanCount,
    overscanColumnCount: overscanCount,
    onScroll: handleScroll,
    ...(scrollToRow !== undefined && {
      scrollToRow,
      scrollToAlignment
    }),
    ...(scrollToColumn !== undefined && {
      scrollToColumn,
      scrollToAlignment
    })
  }), [rowCount, columnsCount, height, width, overscanCount, handleScroll, scrollToRow, scrollToColumn, scrollToAlignment]);

  // Calculate grid item dimensions
  const getColumnWidth = useCallback((columnIndex: number) => {
    if (typeof itemWidth === 'function') {
      return itemWidth(columnIndex) + gap;
    }
    return itemWidth + gap;
  }, [itemWidth, gap]);

  const getRowHeight = useCallback((rowIndex: number) => {
    if (typeof itemHeight === 'function') {
      return itemHeight(rowIndex) + gap;
    }
    return itemHeight + gap;
  }, [itemHeight, gap]);

  // If we shouldn't virtualize, render normally
  if (!shouldVirtualize) {
    return (
      <div 
        className={cn("overflow-auto", className)}
        style={{ height, width }}
      >
        <div 
          className="grid"
          style={{ 
            gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
            gap: `${gap}px`,
            padding: `${gap}px`
          }}
        >
          {items.map((item, index) => {
            const rowIndex = Math.floor(index / columnsCount);
            const columnIndex = index % columnsCount;
            const key = getItemKey ? getItemKey(index, item) : index;
            
            return (
              <div
                key={key}
                className={cn("flex items-center justify-center", itemClassName)}
                style={{ 
                  width: typeof itemWidth === 'number' ? itemWidth : undefined,
                  height: typeof itemHeight === 'number' ? itemHeight : undefined 
                }}
              >
                {renderItem({ 
                  item, 
                  rowIndex, 
                  columnIndex, 
                  style: { 
                    width: typeof itemWidth === 'number' ? itemWidth : 'auto',
                    height: typeof itemHeight === 'number' ? itemHeight : 'auto'
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Variable size grid
  if (isVariableWidth || isVariableHeight) {
    return (
      <div className={className}>
        <VariableSizeGrid
          {...gridProps}
          columnWidth={getColumnWidth}
          rowHeight={getRowHeight}
          itemKey={itemKey}
        >
          {GridItem}
        </VariableSizeGrid>
      </div>
    );
  }

  // Fixed size grid
  return (
    <div className={className}>
      <Grid
        {...gridProps}
        columnWidth={itemWidth as number + gap}
        rowHeight={itemHeight as number + gap}
        itemKey={itemKey}
      >
        {GridItem}
      </Grid>
    </div>
  );
}

export default VirtualizedGrid; 