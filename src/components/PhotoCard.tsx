/**
 * PhotoCard Component - Performance Optimized
 * 
 * BEFORE: No memoization, expensive operations on every render
 * AFTER: React.memo, useMemo for expensive computations, useCallback for handlers
 * 
 * Addresses performance architecture smells:
 * ✅ React.memo for expensive component re-renders
 * ✅ useMemo for expensive computations (>10ms)
 * ✅ useCallback for event handlers to prevent child re-renders
 * ✅ Proper memoization strategy
 */

import React, { useMemo, useCallback } from 'react';
import { Photo, PhotoStatus } from '../types';
import { IconSync, IconError, IconEye, IconCheck } from './Icons';
import { generatePhotographSchema, generateAgentEntityData, generateJsonLD } from '../utils/agent-native/structured-data';

interface PhotoCardProps {
  photo: Photo;
  onSelect: (photo: Photo) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (photoId: string) => void;
  onRetry: (photoId: string) => void;
}

/**
 * Optimized PhotoCard with proper memoization
 */
export const PhotoCard: React.FC<PhotoCardProps> = React.memo(({ 
  photo, 
  onSelect, 
  isSelectionMode, 
  isSelected, 
  onToggleSelection, 
  onRetry 
}) => {
  // Memoize expensive status calculations
  const statusInfo = useMemo(() => ({
    isUploading: photo.status === PhotoStatus.UPLOADING,
    hasError: photo.status === PhotoStatus.ERROR,
    needsReview: photo.status === PhotoStatus.ANALYZED && photo.isAutoProcessed
  }), [photo.status, photo.isAutoProcessed]);

  // Memoize expensive Schema.org data generation
  const structuredData = useMemo(() => {
    const photographSchema = generatePhotographSchema(photo);
    const jsonLD = generateJsonLD(photographSchema);
    
    const agentActions = ['view', 'share'];
    if (!statusInfo.isUploading) {
      agentActions.push('analyze', 'edit');
    }
    const agentEntityData = generateAgentEntityData('photo', photo.id, agentActions);
    
    return { jsonLD, agentEntityData };
  }, [photo, statusInfo.isUploading]);

  // Memoize CSS classes calculation
  const cssClasses = useMemo(() => {
    const baseClasses = "bg-slate-800 rounded-lg overflow-hidden shadow-lg border flex flex-col transition-all duration-300";
    let stateClasses = 'border-slate-700 group';
    
    if (isSelectionMode) {
      stateClasses += isSelected 
        ? ' border-blue-500 scale-105 shadow-blue-500/20' 
        : ' border-slate-600 hover:border-blue-700 cursor-pointer';
    } else {
      stateClasses += statusInfo.isUploading
        ? ' opacity-60 border-slate-700'
        : statusInfo.hasError
        ? ' border-red-600'
        : statusInfo.needsReview
        ? ' border-yellow-500/80 hover:shadow-yellow-500/10 hover:border-yellow-500 cursor-pointer'
        : ' hover:shadow-cyan-500/10 hover:border-cyan-800 hover:scale-105 cursor-pointer';
    }
    
    return `${baseClasses} ${stateClasses}`;
  }, [isSelectionMode, isSelected, statusInfo]);

  // Memoize title and tooltip text
  const displayText = useMemo(() => ({
    title: photo.aiData?.title || photo.title || photo.filename || "User upload",
    tooltip: statusInfo.hasError 
      ? photo.error || 'An error occurred' 
      : statusInfo.needsReview 
      ? 'This photo needs your review.' 
      : undefined,
    subtitle: photo.id.startsWith('upload-') ? 'New Upload' : photo.id
  }), [photo, statusInfo]);

  // Memoized event handlers to prevent child re-renders
  const handleClick = useCallback(() => {
    if (isSelectionMode) {
      onToggleSelection(photo.id);
    } else if (!statusInfo.isUploading) {
      onSelect(photo);
    }
  }, [isSelectionMode, statusInfo.isUploading, onToggleSelection, onSelect, photo]);

  const handleRetry = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRetry(photo.id);
  }, [onRetry, photo.id]);

  return (
    <article 
      itemScope
      itemType="https://schema.org/Photograph"
      {...structuredData.agentEntityData}
      className={cssClasses}
      onClick={handleClick}
      title={displayText.tooltip}
    >
      {/* JSON-LD Structured Data - memoized */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData.jsonLD }} />
      
      {/* Schema.org microdata attributes */}
      <meta itemProp="identifier" content={photo.id} />
      <meta itemProp="name" content={displayText.title} />
      <meta itemProp="contentUrl" content={photo.url} />
      {photo.thumbnailUrl && <meta itemProp="thumbnailUrl" content={photo.thumbnailUrl} />}
      {photo.description && <meta itemProp="description" content={photo.description} />}
      {photo.keywords && <meta itemProp="keywords" content={photo.keywords.join(', ')} />}
      {photo.creator && <meta itemProp="creator" content={photo.creator} />}
      {photo.uploadDate && <meta itemProp="dateCreated" content={photo.uploadDate} />}
      {photo.width && <meta itemProp="width" content={photo.width.toString()} />}
      {photo.height && <meta itemProp="height" content={photo.height.toString()} />}
      
      <div className="relative">
        <img 
          src={photo.imageUrl} 
          alt={displayText.title} 
          className="w-full h-48 object-cover"
          itemProp="contentUrl"
        />
        
        {/* Status overlays */}
        {statusInfo.isUploading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-center">
            <IconSync className="w-8 h-8 text-white animate-spin" />
            <p className="text-white text-sm mt-2 font-semibold">Uploading...</p>
          </div>
        )}
        
        {statusInfo.hasError && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-center">
            <IconError className="w-8 h-8 text-red-400" />
            <p className="text-red-400 text-sm mt-2 font-semibold">Action Failed</p>
            <button 
              onClick={handleRetry}
              className="mt-2 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold px-3 py-1 rounded-full transition"
            >
              Retry
            </button>
          </div>
        )}
        
        {!isSelectionMode && !statusInfo.isUploading && !statusInfo.hasError && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
            <p className="text-white font-bold text-lg text-center drop-shadow-md">View Details</p>
          </div>
        )}

        {isSelectionMode && (
          <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-blue-600/40' : 'bg-black/50 group-hover:bg-black/20'}`}>
            <div className="absolute top-2 left-2 w-6 h-6 rounded-md border-2 border-white flex items-center justify-center bg-black/30">
              {isSelected && <IconCheck className="w-5 h-5 text-white" />}
            </div>
          </div>
        )}
        
        {statusInfo.needsReview && !statusInfo.isUploading && !statusInfo.hasError && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <IconEye className="w-3 h-3"/>
            <span>Review</span>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <p className="text-white font-semibold truncate" title={displayText.title}>
          {displayText.title}
        </p>
        <p className="text-xs text-slate-400">{displayText.subtitle}</p>
      </div>
    </article>
  );
});

PhotoCard.displayName = 'PhotoCard';