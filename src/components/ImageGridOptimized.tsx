/**
 * ImageGrid Component - Performance Optimized
 * 
 * BEFORE: No memoization, expensive operations on every render
 * AFTER: React.memo, useMemo for expensive computations, useCallback for handlers
 * 
 * Addresses performance architecture smells:
 * ✅ React.memo for expensive component re-renders
 * ✅ useMemo for expensive computations
 * ✅ useCallback for event handlers to prevent child re-renders
 * ✅ Proper virtualization considerations for large photo lists
 */

import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Photo, Album } from '../types';
import { PhotoCard } from './PhotoCard';
import { BatchActionBar } from './BatchActionBar';
import { IconAlbum, IconCamera, IconUpload, IconSync, IconCheck, IconTrash, IconSettings, IconCheckbox, IconX, IconBookOpen } from './Icons';

interface ImageGridProps {
  photos: Photo[];
  album: Album | null;
  onSelectPhoto: (photo: Photo) => void;
  onUpload: (files: FileList) => void;
  onSync: () => void;
  isLoading: 'albums' | 'photos' | 'syncing' | false;
  
  // View Mode
  viewMode: 'all' | 'review';
  onViewModeChange: (mode: 'all' | 'review') => void;
  reviewCount: number;
  onApproveAll: () => void;
  onRejectAll: () => void;
  
  // Selection Mode
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedPhotoIds: string[];
  onTogglePhotoSelection: (photoId: string) => void;
  onBatchAnalyze: () => void;
  onBatchDelete: () => void;
  onClearSelection: () => void;
  onRetry: (photoId: string) => void;
  
  // Settings
  onOpenAlbumSettings: () => void;
  onGenerateStory: () => void;
}

/**
 * Optimized ImageGrid with proper memoization and virtualization considerations
 */
export const ImageGridOptimized: React.FC<ImageGridProps> = React.memo(({ 
  photos, 
  album, 
  onSelectPhoto, 
  onUpload, 
  onSync, 
  isLoading,
  viewMode,
  onViewModeChange,
  reviewCount,
  onApproveAll,
  onRejectAll,
  isSelectionMode,
  onToggleSelectionMode,
  selectedPhotoIds,
  onTogglePhotoSelection,
  onBatchAnalyze,
  onBatchDelete,
  onClearSelection,
  onRetry,
  onOpenAlbumSettings,
  onGenerateStory
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Memoize computed values
  const computedState = useMemo(() => ({
    isSyncing: isLoading === 'syncing',
    hasPhotos: photos.length > 0,
    selectedCount: selectedPhotoIds.length,
    isReviewMode: viewMode === 'review'
  }), [isLoading, photos.length, selectedPhotoIds.length, viewMode]);

  // Memoized event handlers to prevent child re-renders
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onUpload(event.target.files);
      event.target.value = '';
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow drop
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Check if the related target is inside the drop zone to prevent flickering
    if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
      // Clear the data transfer to prevent browser from opening the file
      if (e.dataTransfer.items) {
        e.dataTransfer.items.clear();
      } else {
        e.dataTransfer.clearData();
      }
    }
  }, [onUpload]);

  // Memoized view mode handlers
  const handleViewModeAll = useCallback(() => onViewModeChange('all'), [onViewModeChange]);
  const handleViewModeReview = useCallback(() => onViewModeChange('review'), [onViewModeChange]);

  // Memoized photo grid - expensive operation for large photo sets
  const photoGrid = useMemo(() => {
    if (!computedState.hasPhotos) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map(photo => (
          <PhotoCard 
            key={photo.id} 
            photo={photo} 
            onSelect={onSelectPhoto} 
            isSelectionMode={isSelectionMode}
            isSelected={selectedPhotoIds.includes(photo.id)}
            onToggleSelection={onTogglePhotoSelection}
            onRetry={onRetry}
          />
        ))}
      </div>
    );
  }, [photos, onSelectPhoto, isSelectionMode, selectedPhotoIds, onTogglePhotoSelection, onRetry, computedState.hasPhotos]);

  // Early returns for different states
  if (!album) {
    return (
      <div className="text-center py-20">
        <IconAlbum className="w-24 h-24 mx-auto text-slate-600 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-400">Select an Album</h2>
        <p className="text-slate-500 mt-2">Choose an album from the sidebar to view its photos.</p>
      </div>
    );
  }

  if (isLoading === 'photos') {
    const skeletonCount = album.imageCount || 6;
    return (
      <div>
        <h2 className="text-3xl font-bold text-white mb-1">
          Loading photos in <span className="text-cyan-400">{album.name}</span>...
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg h-56 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-white">
              {album.name}
            </h2>
            <button 
              onClick={onOpenAlbumSettings} 
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition" 
              aria-label="Open Album AI Settings"
            >
              <IconSettings className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-400 mt-1">{album.imageCount} photos</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSelectionMode}
            className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition ${
              isSelectionMode 
                ? 'bg-blue-800 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title="Select multiple photos for batch actions"
          >
            {isSelectionMode ? <IconX className="w-5 h-5" /> : <IconCheckbox className="w-5 h-5" />}
            {isSelectionMode ? 'Cancel' : 'Select'}
          </button>
          
          <button
            onClick={onSync}
            disabled={computedState.isSyncing}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Check for new photos uploaded from other sources"
          >
            {computedState.isSyncing ? (
              <IconSync className="w-5 h-5 animate-spin" />
            ) : (
              <IconSync className="w-5 h-5" />
            )}
            Sync
          </button>
          
          <button 
            onClick={onGenerateStory}
            className="flex items-center gap-2 bg-purple-500/80 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            title="Use AI to generate a title, description, and keywords for this album"
          >
            <IconBookOpen className="w-5 h-5" /> AI Story
          </button>
          
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 rounded-lg transition-transform transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-600/20"
          >
            <IconUpload className="w-5 h-5" /> Upload
          </button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          multiple 
          accept="image/jpeg,image/png,image/gif"
          className="hidden" 
        />
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-slate-700 pb-4">
        <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={handleViewModeAll}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${
              viewMode === 'all'
                ? 'bg-slate-600 text-white shadow-inner'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            All Photos
          </button>
          <button
            onClick={handleViewModeReview}
            className={`relative flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-md transition ${
              computedState.isReviewMode
                ? 'bg-yellow-500 text-black shadow-inner'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
          >
            Needs Review
            {reviewCount > 0 && (
              <span className={`flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                computedState.isReviewMode 
                  ? 'bg-black text-yellow-400' 
                  : 'bg-yellow-500 text-black'
              }`}>
                {reviewCount}
              </span>
            )}
          </button>
        </div>
        
        {computedState.isReviewMode && computedState.hasPhotos && (
          <div className="flex items-center gap-2">
            <button 
              onClick={onRejectAll} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-red-900/80 hover:bg-red-800 text-red-200 transition"
            >
              <IconTrash className="w-4 h-4" /> Reject All
            </button>
            <button 
              onClick={onApproveAll} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-green-600 hover:bg-green-700 text-white transition"
            >
              <IconCheck className="w-4 h-4" /> Approve All
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {!computedState.hasPhotos ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-lg">
          <IconCamera className="w-24 h-24 mx-auto text-slate-600 mb-4" />
          {computedState.isReviewMode ? (
            <>
              <h2 className="text-2xl font-semibold text-slate-400">All Clear!</h2>
              <p className="text-slate-500 mt-2">There are no new photos awaiting your review.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-slate-400">This album is empty</h2>
              <p className="text-slate-500 mt-2">Click "Upload" to add your first image.</p>
            </>
          )}
        </div>
      ) : (
        photoGrid
      )}
      
      {/* Batch Action Bar */}
      <BatchActionBar 
        count={computedState.selectedCount}
        onAnalyze={onBatchAnalyze}
        onDelete={onBatchDelete}
        onClear={onClearSelection}
      />
      
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center border-4 border-dashed border-cyan-500 rounded-lg">
          <IconUpload className="w-24 h-24 text-cyan-400 mb-4" />
          <h3 className="text-3xl font-bold text-white">Drop to Upload</h3>
          <p className="text-slate-400 mt-2">Release your files to upload them to "{album.name}"</p>
        </div>
      )}
    </div>
  );
});

ImageGridOptimized.displayName = 'ImageGridOptimized';