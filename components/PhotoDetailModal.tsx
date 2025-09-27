import React, { useState, useEffect, useRef } from 'react';
import { Photo, AiData, PhotoStatus, AiSettings, Comment } from '../types';
import { smugmugService } from '../services/smugmugService';
import { generatePhotoMetadata } from '../services/geminiService';
import { IconCheck, IconSparkles, IconSync, IconError, IconTrash, IconRobot, IconMessageCircle, IconInfo, IconSettings } from './Icons';
import { KeywordInput } from './KeywordInput';

interface PhotoDetailModalProps {
  photo: Photo;
  onClose: () => void;
  onSaveMetadata: (photo: Photo, data: AiData) => Promise<void>;
  onDeletePhoto: (photo: Photo) => Promise<void>;
  onRetry: (photoId: string) => void;
  aiConfig: AiSettings;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({ photo, onClose, onSaveMetadata, onDeletePhoto, onRetry, aiConfig }) => {
  const [localData, setLocalData] = useState<AiData>(photo.aiData);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const confirmDeleteTimer = useRef<number | null>(null);
  
  // New state for tabs and comments
  const [activeTab, setActiveTab] = useState<'metadata' | 'comments'>('metadata');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  useEffect(() => {
    setLocalData(photo.aiData);
    // Reset tabs and comments when photo changes
    setActiveTab('metadata');
    setComments([]);
    setCommentsError(null);
    setIsCommentsLoading(false);
  }, [photo]);
  
  // Fetch comments when the comments tab is activated for the first time
  useEffect(() => {
      const fetchComments = async () => {
          setIsCommentsLoading(true);
          setCommentsError(null);
          try {
              const fetchedComments = await smugmugService.fetchImageComments(photo.uri);
              setComments(fetchedComments);
          } catch (e) {
              setCommentsError('Failed to load comments.');
              console.error(e);
          } finally {
              setIsCommentsLoading(false);
          }
      };
      
      if (activeTab === 'comments' && comments.length === 0 && !commentsError) {
          fetchComments();
      }
  }, [activeTab, photo.uri, comments.length, commentsError]);
  
  // Cleanup timer on unmount
  useEffect(() => {
      return () => {
          if(confirmDeleteTimer.current) {
              clearTimeout(confirmDeleteTimer.current);
          }
      }
  }, []);

  const handleInputChange = <K extends keyof AiData,>(field: K, value: AiData[K]) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAnalyze = async () => {
      onRetry(photo.id);
  };
  
  const handleUpdateSmugMug = async () => {
    await onSaveMetadata(photo, localData);
  };

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
        handleConfirmDelete();
    } else {
        setIsConfirmingDelete(true);
        confirmDeleteTimer.current = window.setTimeout(() => {
            setIsConfirmingDelete(false);
        }, 3000); // Reset after 3 seconds
    }
  };

  const handleConfirmDelete = async () => {
    if(confirmDeleteTimer.current) clearTimeout(confirmDeleteTimer.current);
    await onDeletePhoto(photo);
  };
  
  const handleRetry = () => {
      onRetry(photo.id);
  }

  const isActionInProgress = [
      PhotoStatus.ANALYZING, 
      PhotoStatus.UPDATING, 
      PhotoStatus.DELETING
    ].includes(photo.status);
    
  const isReviewing = photo.status === PhotoStatus.ANALYZED && !!photo.isAutoProcessed;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] border border-slate-700 flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-2/3 bg-slate-900 flex items-center justify-center">
            <img src={photo.imageUrl} alt={localData.title} className="max-w-full max-h-full object-contain"/>
        </div>
        <div className="w-1/3 p-6 flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Photo Details</h2>
                        <p className="text-sm text-slate-400 mb-4">ImageKey: {photo.id}</p>
                    </div>
                     <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none" aria-label="Close">&times;</button>
                </div>
                 {photo.isAutoProcessed && (
                    <div className="mb-4 flex items-center gap-2 bg-blue-900/50 text-blue-300 text-sm px-3 py-1.5 rounded-md border border-blue-800">
                        <IconRobot className="w-4 h-4" />
                        <span>Auto-analyzed by AI</span>
                    </div>
                )}
                {/* TABS */}
                 <div className="border-b border-slate-700 mb-4">
                    <nav className="-mb-px flex gap-4" aria-label="Tabs">
                        <button 
                            onClick={() => setActiveTab('metadata')}
                            className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'metadata' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}`}
                            aria-current={activeTab === 'metadata' ? 'page' : undefined}
                        >
                            <IconSettings className="w-5 h-5" /> Metadata
                        </button>
                        <button 
                            onClick={() => setActiveTab('comments')}
                            className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'comments' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'}`}
                             aria-current={activeTab === 'comments' ? 'page' : undefined}
                        >
                             <IconMessageCircle className="w-5 h-5" /> Comments
                        </button>
                    </nav>
                 </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                {activeTab === 'metadata' && (
                    <>
                        {photo.status === PhotoStatus.ANALYZING ? (
                             <div className="flex-grow flex flex-col justify-center items-center h-full">
                                <p className="text-slate-400 mb-2">Analyzing with AI...</p>
                                <div className="w-full bg-slate-700 rounded-md h-6 animate-pulse mb-3"></div>
                                <div className="w-full bg-slate-700 rounded-md h-16 animate-pulse mb-3"></div>
                                <div className="w-full bg-slate-700 rounded-md h-12 animate-pulse"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-cyan-400">Title</label>
                                    <input
                                    type="text"
                                    value={localData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full bg-slate-700/50 border-b-2 border-slate-600 text-white rounded-t-md px-2 py-1 focus:ring-0 focus:border-cyan-500 outline-none transition text-lg font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-cyan-400">Description</label>
                                    <textarea
                                    value={localData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full bg-slate-700/50 border-b-2 border-slate-600 text-slate-300 rounded-t-md px-2 py-1 focus:ring-0 focus:border-cyan-500 outline-none transition text-sm h-32 resize-y"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-cyan-400">Keywords</label>
                                    <KeywordInput
                                    keywords={localData.keywords}
                                    onChange={(newKeywords) => handleInputChange('keywords', newKeywords)}
                                    placeholder="Add keywords..."
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
                {activeTab === 'comments' && (
                    <div className="space-y-4">
                        {isCommentsLoading ? (
                            <div className="space-y-3 animate-pulse">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-slate-700 rounded-lg p-3">
                                        <div className="h-4 bg-slate-600 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-slate-600 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        ) : commentsError ? (
                             <div className="flex flex-col items-center justify-center text-center text-red-400 bg-red-900/30 p-4 rounded-lg">
                                <IconError className="w-10 h-10 mb-2"/>
                                <p className="font-semibold">Error Loading Comments</p>
                                <p className="text-sm">{commentsError}</p>
                            </div>
                        ) : comments.length === 0 ? (
                           <div className="flex flex-col items-center justify-center text-center text-slate-500 bg-slate-900/50 p-4 rounded-lg">
                                <IconInfo className="w-10 h-10 mb-2"/>
                                <p className="font-semibold">No Comments Yet</p>
                                <p className="text-sm">Be the first to share your thoughts on SmugMug!</p>
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                                        <p className="font-bold text-slate-300">{comment.authorName}</p>
                                        <p>{formatDate(comment.date)}</p>
                                    </div>
                                    <p className="text-sm text-slate-200">{comment.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 mt-6 pt-4 border-t border-slate-700">
                {photo.error && (
                    <div className="bg-red-900/50 border border-red-800 text-red-300 p-3 rounded-md mb-4">
                        <p className="font-semibold text-sm">An Error Occurred</p>
                        <p className="text-xs mb-2">{photo.error}</p>
                        <button
                            onClick={handleRetry}
                            className="w-full text-center text-xs font-bold bg-slate-600 hover:bg-slate-500 rounded p-1"
                        >
                            Retry Action
                        </button>
                    </div>
                )}
                <div className="space-y-3">
                    <button
                        onClick={handleAnalyze}
                        disabled={isActionInProgress}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                    >
                         <IconSparkles className="w-5 h-5" /> Analyze with AI
                    </button>
                    <button
                        onClick={handleUpdateSmugMug}
                        disabled={isActionInProgress}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                    >
                        {photo.status === PhotoStatus.UPDATED ? <><IconCheck className="w-5 h-5" /> Updated Successfully</> :
                         photo.status === PhotoStatus.UPDATING ? <><IconSync className="w-5 h-5 animate-spin" /> Saving...</> :
                         isReviewing ? <><IconCheck className="w-5 h-5" /> Approve & Save to SmugMug</> :
                         <><IconCheck className="w-5 h-5" /> Save Changes to SmugMug</>}
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        disabled={isActionInProgress}
                        className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-lg transition ${isConfirmingDelete ? 'bg-red-700 hover:bg-red-800' : 'bg-red-900/50 hover:bg-red-900/80'} disabled:bg-slate-600 disabled:cursor-not-allowed`}
                    >
                        {photo.status === PhotoStatus.DELETING ? <><IconSync className="w-5 h-5 animate-spin" /> Deleting...</> :
                         isConfirmingDelete ? 'Confirm Deletion?' :
                         <><IconTrash className="w-5 h-5" /> Delete Photo</>}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};