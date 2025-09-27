import React, { useState } from 'react';
import { SmartAlbumProcessState } from '../types';
import { IconWand, IconSparkles, IconSync, IconCheck, IconError, IconRobot } from './Icons';

interface SmartAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (prompt: string) => void;
  processState: SmartAlbumProcessState;
}

export const SmartAlbumModal: React.FC<SmartAlbumModalProps> = ({ isOpen, onClose, onStart, processState }) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleStart = () => {
    if (prompt.trim()) {
      onStart(prompt.trim());
    }
  };

  const renderContent = () => {
    switch (processState.status) {
      case 'idle':
        return (
          <>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-slate-900 border border-slate-600 text-slate-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition resize-y"
              placeholder="e.g., Photos of dramatic sunsets over mountains..."
              aria-label="Smart album creation prompt"
            />
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-slate-700">
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition">Cancel</button>
              <button onClick={handleStart} disabled={!prompt.trim()} className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="flex items-center gap-2">
                    <IconSparkles className="w-5 h-5" />
                    Create Album
                </div>
              </button>
            </div>
          </>
        );
      
      case 'complete':
        return (
            <div className="text-center">
                <IconCheck className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{processState.message}</h3>
                {processState.newAlbum ? (
                    <p className="text-slate-400">The new album "{processState.newAlbum.name}" has been added to your library.</p>
                ) : (
                    <p className="text-slate-400">You can find it in your album list.</p>
                )}
                <div className="mt-6">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition">Close</button>
                </div>
            </div>
        );

      case 'error':
        return (
            <div className="text-center">
                <IconError className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">An Error Occurred</h3>
                <p className="text-red-300 bg-red-900/40 p-3 rounded-md">{processState.message}</p>
                <div className="mt-6">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition">Close</button>
                </div>
            </div>
        );

      default: // In-progress states
        const progressPercent = processState.progress ? (processState.progress.current / processState.progress.total) * 100 : 0;
        return (
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <IconRobot className="w-16 h-16 text-purple-400 animate-pulse" />
                    {processState.status === 'analyzing' && (
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white">
                           {Math.round(progressPercent)}%
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{processState.message}</h3>
                {processState.status === 'analyzing' && processState.progress && (
                    <p className="text-slate-400 text-sm">({processState.progress.current} / {processState.progress.total} photos)</p>
                )}

                <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4">
                    {processState.status === 'analyzing' ? (
                        <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    ) : (
                        <div className="bg-purple-500 h-2.5 rounded-full animate-pulse w-full"></div>
                    )}
                </div>
            </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-album-title"
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <IconWand className="w-8 h-8 text-purple-400" />
          <div>
            <h2 id="smart-album-title" className="text-2xl font-bold text-white">Create a Smart Album</h2>
            <p className="text-slate-400">Describe the photos you want to find, and AI will create an album for you.</p>
          </div>
        </div>
        
        <div>{renderContent()}</div>
        
      </div>
    </div>
  );
};
