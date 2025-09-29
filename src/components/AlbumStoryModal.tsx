import React, { useState, useEffect } from 'react';
import { AlbumStory, AlbumStoryState, Album } from '../types';
import { IconBookOpen, IconCheck, IconError, IconSync } from './Icons';
import { KeywordInput } from './KeywordInput';

interface AlbumStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (story: AlbumStory) => void;
  albumStoryState: AlbumStoryState;
  album: Album;
}

export const AlbumStoryModal: React.FC<AlbumStoryModalProps> = ({ 
    isOpen, 
    onClose, 
    onApply,
    albumStoryState,
    album
}) => {
  const [localStory, setLocalStory] = useState<AlbumStory | null>(albumStoryState.story);

  useEffect(() => {
    if(albumStoryState.status === 'ready' || albumStoryState.status === 'error') {
        setLocalStory(albumStoryState.story);
    }
  }, [albumStoryState]);

  if (!isOpen) return null;
  
  const handleApply = () => {
      if (localStory) {
          onApply(localStory);
      }
  };

  const handleInputChange = <K extends keyof AlbumStory>(field: K, value: AlbumStory[K]) => {
      if (localStory) {
        setLocalStory({ ...localStory, [field]: value });
      }
  };

  const renderContent = () => {
    switch (albumStoryState.status) {
      case 'generating':
        return (
          <div className="text-center p-8">
            <IconBookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">Generating Album Story...</h3>
            <p className="text-slate-400">The AI is analyzing all the photos in "{album.name}" to create a compelling narrative.</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center p-8">
            <IconError className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Story Generation Failed</h3>
            <p className="text-red-300 bg-red-900/40 p-3 rounded-md">{albumStoryState.error}</p>
          </div>
        );
        
      case 'ready':
      case 'applying':
          if (!localStory) return null; // Should not happen in 'ready' state
          return (
              <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-purple-300">Suggested Title</label>
                    <input
                        type="text"
                        value={localStory.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full bg-slate-700/50 border-b-2 border-slate-600 text-white rounded-t-md px-2 py-1 focus:ring-0 focus:border-purple-500 outline-none transition text-lg font-bold"
                    />
                  </div>
                   <div>
                    <label className="text-sm font-semibold text-purple-300">Suggested Description</label>
                    <textarea
                        value={localStory.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full h-40 bg-slate-700/50 border-b-2 border-slate-600 text-slate-300 rounded-t-md px-2 py-1 focus:ring-0 focus:border-purple-500 outline-none transition text-sm resize-y"
                    />
                  </div>
                   <div>
                    <label className="text-sm font-semibold text-purple-300">Suggested Keywords</label>
                    <KeywordInput
                        keywords={localStory.keywords}
                        onChange={(newKeywords) => handleInputChange('keywords', newKeywords)}
                        placeholder="Add album keywords..."
                    />
                  </div>
              </div>
          );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-story-title"
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 p-6">
            <div className="flex items-center gap-3 mb-2">
                <IconBookOpen className="w-8 h-8 text-purple-400" />
                <div>
                    <h2 id="album-story-title" className="text-2xl font-bold text-white">AI Album Storyteller</h2>
                    <p className="text-slate-400">Review the AI's suggestions for "{album.name}".</p>
                </div>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto px-6 pb-6">
            {renderContent()}
        </div>

        <div className="flex-shrink-0 flex justify-end gap-4 mt-auto p-6 border-t border-slate-700">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition">
                Cancel
            </button>
            {(albumStoryState.status === 'ready' || albumStoryState.status === 'applying') && (
                <button
                    onClick={handleApply}
                    disabled={albumStoryState.status === 'applying'}
                    className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                    <div className="flex items-center gap-2">
                        {albumStoryState.status === 'applying' ? (
                            <><IconSync className="w-5 h-5 animate-spin"/> Applying...</>
                        ) : (
                            <><IconCheck className="w-5 h-5" /> Apply to Album</>
                        )}
                    </div>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};