/**
 * ResultsGrid Component
 * 
 * Displays a grid of photos with optional selection capabilities.
 * Supports bulk selection, individual photo selection, and selection statistics.
 */

import React from 'react';
import { Photo } from '../types';

export interface ResultsGridProps {
  photos: Photo[];
  selectionMode?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  agentActionable?: boolean;
  showSelectAll?: boolean;
  showSelectionStats?: boolean;
}

// Helper functions
const calculateTotalSize = (selectedIds: string[]): number => {
  return selectedIds.length * 2.1; // Default 2.1MB per photo
};

// Selection controls component
const SelectionControls: React.FC<{
  onSelectAll: () => void;
  onSelectNone: () => void;
}> = ({ onSelectAll, onSelectNone }) => (
  <div className="selection-controls">
    <button onClick={onSelectAll}>Select All</button>
    <button onClick={onSelectNone}>Select None</button>
  </div>
);

// Selection statistics component
const SelectionStats: React.FC<{
  selectedCount: number;
  totalSize: number;
}> = ({ selectedCount, totalSize }) => (
  <div className="selection-stats">
    <span>{selectedCount} photos selected</span>
    <span>Total size: ~{totalSize.toFixed(1)} MB</span>
  </div>
);

// Photo item component
interface PhotoItemProps {
  photo: Photo;
  isSelected: boolean;
  selectionMode: boolean;
  onToggleSelection: (id: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ 
  photo, 
  isSelected, 
  selectionMode, 
  onToggleSelection 
}) => {
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (selectionMode && event.key === ' ') {
      event.preventDefault();
      onToggleSelection(photo.id);
    }
  };

  return (
    <div 
      className="relative bg-white rounded-lg shadow-sm p-2"
      data-testid={`photo-${photo.id}`}
      tabIndex={selectionMode ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(photo.id)}
            className="w-4 h-4 text-blue-600 rounded"
            data-testid={`photo-checkbox-${photo.id}`}
          />
        </div>
      )}
      <div className="aspect-square bg-gray-200 rounded mb-2" />
      <p className="text-sm text-gray-700 truncate">
        {photo.filename || photo.title || photo.aiData?.title || photo.id}
      </p>
    </div>
  );
};

// Custom hook for selection handling
const usePhotoSelection = (
  selectedIds: string[],
  onSelectionChange?: (selectedIds: string[]) => void,
  photos: Photo[] = []
): {
  handlePhotoSelection: (photoId: string, isSelected: boolean) => void;
  handleSelectAll: () => void;
  handleSelectNone: () => void;
} => {
  const handlePhotoSelection = (photoId: string, isSelected: boolean): void => {
    if (!onSelectionChange) return;
    
    if (isSelected) {
      onSelectionChange([...selectedIds, photoId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== photoId));
    }
  };

  const handleSelectAll = (): void => {
    if (!onSelectionChange) return;
    onSelectionChange(photos.map(p => p.id));
  };

  const handleSelectNone = (): void => {
    if (!onSelectionChange) return;
    onSelectionChange([]);
  };

  return { handlePhotoSelection, handleSelectAll, handleSelectNone };
};

// Photo grid renderer
const renderPhotoGrid = (
  photos: Photo[],
  selectionMode: boolean,
  selectedIds: string[],
  handlePhotoSelection: (photoId: string, isSelected: boolean) => void
): React.ReactElement => (
  <div className="photo-grid">
    {photos?.map(photo => (
      <PhotoItem
        key={photo.id}
        photo={photo}
        selectionMode={selectionMode}
        isSelected={selectedIds.includes(photo.id)}
        onToggleSelection={(id) => handlePhotoSelection(id, !selectedIds.includes(id))}
      />
    ))}
  </div>
);

export const ResultsGrid: React.FC<ResultsGridProps> = ({ 
  photos,
  selectionMode = false,
  selectedIds = [],
  onSelectionChange,
  showSelectAll = true,
  showSelectionStats = true
}) => {
  const { handlePhotoSelection, handleSelectAll, handleSelectNone } = usePhotoSelection(
    selectedIds,
    onSelectionChange,
    photos
  );

  const totalSize = calculateTotalSize(selectedIds);
  const showControls = selectionMode && showSelectAll;
  const showStats = selectionMode && showSelectionStats && selectedIds.length > 0;

  return (
    <div className="results-grid">
      {showControls && (
        <SelectionControls onSelectAll={handleSelectAll} onSelectNone={handleSelectNone} />
      )}
      
      {showStats && (
        <SelectionStats selectedCount={selectedIds.length} totalSize={totalSize} />
      )}

      {renderPhotoGrid(photos, selectionMode, selectedIds, handlePhotoSelection)}
    </div>
  );
};