/**
 * BulkSelectionManager Component
 * 
 * Manages bulk photo selection functionality.
 * Extracted from BulkOperations.tsx to maintain file size limits.
 */

import React from 'react';
import { Photo } from '../types';

interface BulkSelectionManagerProps {
  photos?: Photo[];
  selectedPhotos?: Photo[];
  onSelectionChange?: (selectedPhotos: Photo[]) => void;
  selectionMode?: 'single' | 'multiple';
  maxSelections?: number;
}

export const BulkSelectionManager: React.FC<BulkSelectionManagerProps> = ({ photos }) => (
  <div>BulkSelectionManager placeholder - {photos?.length} photos</div>
);