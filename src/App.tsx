import React, { useState, useCallback, useEffect } from 'react';
import { PhotoCard } from './components/PhotoCard';
import { SettingsModal } from './components/SettingsModal';
import { AlbumSettingsModal } from './components/AlbumSettingsModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { LoginScreen } from './components/LoginScreen';
import { smugmugService } from './services/mockSmugMugService'; // Use mock service for development
import './utils/agent-actions-init'; // Initialize agent actions
import { Photo, Album, SmugMugCredentials, PhotoStatus, SmugMugNode, AutomationMode, AppNotification, AiSettings, ActivityLogEntry, AiData, SmartAlbumProcessState, AlbumStoryState, AlbumStory } from './types';
import { IconCamera, IconSettings, IconFileText } from './components/Icons';
import { AlbumList } from './components/AlbumList';
import { ImageGrid } from './components/ImageGrid';
import { AutomationControl } from './components/AutomationControl';
import { NotificationContainer } from './components/Notification';
import { ActivityFeed } from './components/ActivityFeed';
import { generatePhotoMetadata, doesImageMatchPrompt, generateAlbumStory } from './services/geminiService';
import { SmartAlbumModal } from './components/SmartAlbumModal';
import { AlbumStoryModal } from './components/AlbumStoryModal';
import { DocsModal } from './components/DocsModal';


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nodeTree, setNodeTree] = useState<SmugMugNode[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState<'albums' | 'photos' | 'syncing' | false>(false);
  const [error, setError] = useState<string | null>(null);

  // Global Settings states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [keywordDenylist, setKeywordDenylist] = useState('');
  const [keywordPreferredlist, setKeywordPreferredlist] = useState('');
  
  // Per-album settings
  const [albumSettingsOverrides, setAlbumSettingsOverrides] = useState<Record<string, Partial<AiSettings>>>(() => {
    const saved = localStorage.getItem('smugmugAiTagger_albumSettingsOverrides');
    return saved ? JSON.parse(saved) : {};
  });
  const [isAlbumSettingsOpen, setIsAlbumSettingsOpen] = useState(false);


  // Automation & View states
  const [automationMode, setAutomationMode] = useState<AutomationMode>(
    () => (localStorage.getItem('smugmugAiTagger_automationMode') as AutomationMode) || 'off'
  );
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'review'>('all');
  
  // Auto-sync states
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(
    () => localStorage.getItem('smugmugAiTagger_autoSyncEnabled') === 'true'
  );
  const [autoSyncInterval, setAutoSyncInterval] = useState(
    () => parseInt(localStorage.getItem('smugmugAiTagger_autoSyncInterval') || '5', 10)
  );

  // Selection states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  
  // Activity Feed states
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);

  // Smart Album states
  const [isSmartAlbumModalOpen, setIsSmartAlbumModalOpen] = useState(false);
  const [smartAlbumProcessState, setSmartAlbumProcessState] = useState<SmartAlbumProcessState>({
      status: 'idle',
      message: ''
  });
  
  // Album Story states
  const [isAlbumStoryModalOpen, setIsAlbumStoryModalOpen] = useState(false);
  const [albumStoryState, setAlbumStoryState] = useState<AlbumStoryState>({
      status: 'idle',
      story: null,
      error: null
  });
  
  // Docs Modal State
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  
  const addActivityLog = useCallback((message: string, type: ActivityLogEntry['type']) => {
    const newEntry: ActivityLogEntry = { id: Date.now(), timestamp: new Date(), message, type };
    setActivityLog(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
  }, []);


  useEffect(() => {
    // Load global AI settings from local storage on mount
    setCustomInstructions(localStorage.getItem('smugmugAiTagger_customInstructions') || '');
    setKeywordDenylist(localStorage.getItem('smugmugAiTagger_keywordDenylist') || '');
    setKeywordPreferredlist(localStorage.getItem('smugmugAiTagger_keywordPreferredlist') || '');
    localStorage.setItem('smugmugAiTagger_automationMode', automationMode);
  }, [automationMode]);
  
   useEffect(() => {
    // Cleanup for Object URLs created during upload
    return () => {
      photos.forEach(photo => {
        if (photo.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(photo.imageUrl);
        }
      });
    };
  }, [photos]);
  
  // Auto-sync effect
  useEffect(() => {
    if (!isAutoSyncEnabled || !selectedAlbum || isSelectionMode) {
      return;
    }

    const intervalId = setInterval(() => {
      if (isLoading !== 'syncing') {
        console.log(`Auto-sync triggered for ${selectedAlbum.name}`);
        handleSyncAlbum();
      }
    }, autoSyncInterval * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAutoSyncEnabled, autoSyncInterval, selectedAlbum, isLoading, isSelectionMode]);

  const handleLogin = (credentials: SmugMugCredentials) => {
    smugmugService.init(credentials);
    setIsLoggedIn(true);
    addActivityLog('Successfully connected to SmugMug.', 'info');
    fetchNodeTree();
  };

  const fetchNodeTree = useCallback(async () => {
    setIsLoading('albums');
    setError(null);
    addActivityLog('Fetching album and folder structure...', 'sync');
    try {
      const fetchedNodes = await smugmugService.fetchNodeTree();
      setNodeTree(fetchedNodes);
      addActivityLog('Successfully loaded albums and folders.', 'success');
    } catch (e) {
      handleApiError(e, 'Failed to fetch albums and folders');
    } finally {
      setIsLoading(false);
    }
  }, [addActivityLog]);
  
  const handleApiError = useCallback((e: unknown, context: string) => {
    console.error(`${context}:`, e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    addNotification(`${context}. ${errorMessage}`, 'info');
    setError(`${context}. ${errorMessage}`);
    addActivityLog(`${context}.`, 'error');
  }, [addActivityLog]);

  const handleSelectAlbum = useCallback(async (album: Album) => {
    setViewMode('all'); // Reset view when changing albums
    setIsSelectionMode(false);
    setSelectedPhotoIds([]);
    setSelectedAlbum(album);
    setPhotos([]); // Clear previous photos
    setIsLoading('photos');
    setError(null);
    addActivityLog(`Fetching photos for "${album.name}"...`, 'info');
    try {
      const fetchedPhotos = await smugmugService.fetchAlbumImages(album.uri);
      setPhotos(fetchedPhotos);
      addActivityLog(`Loaded ${fetchedPhotos.length} photos from "${album.name}".`, 'success');
    } catch (e) {
      handleApiError(e, `Failed to fetch photos for album "${album.name}"`);
    } finally {
      setIsLoading(false);
    }
  }, [addActivityLog, handleApiError]);
  
  const handleCreateAlbum = async (albumName: string) => {
      if(!albumName) return;
      addActivityLog(`Creating new album: "${albumName}"...`, 'info');
      try {
        const newAlbum = await smugmugService.createAlbum({Name: albumName, UrlName: albumName.replace(/\s+/g, '-')});
        setNodeTree(prev => [newAlbum, ...prev]);
        handleSelectAlbum(newAlbum);
        addActivityLog(`Album "${albumName}" created successfully.`, 'success');
      } catch(e) {
        handleApiError(e, "Failed to create new album");
      }
  };

  const setAlbumImageCount = (nodes: SmugMugNode[], albumId: string, newCount: number): SmugMugNode[] => {
      return nodes.map(node => {
          if (node.type === 'Album' && node.id === albumId) {
              return { ...node, imageCount: newCount };
          }
          if (node.type === 'Folder') {
              return { ...node, children: setAlbumImageCount(node.children, albumId, newCount) };
          }
          return node;
      });
  };

  const internalHandlePhotoDelete = (deletedPhotoId: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== deletedPhotoId));
    if (selectedAlbum) {
      const newCount = selectedAlbum.imageCount - 1;
      setNodeTree(prevTree => setAlbumImageCount(prevTree, selectedAlbum.id, newCount));
      const updatedAlbum = { ...selectedAlbum, imageCount: newCount };
      setSelectedAlbum(updatedAlbum);
    }
    setSelectedPhoto(null); // Close the modal
    setSelectedPhotoIds(prev => prev.filter(id => id !== deletedPhotoId));
  };
  
    const addNotification = useCallback((message: string, type: AppNotification['type']) => {
        const newNotification = { id: Date.now(), message, type };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getResolvedAiConfig = useCallback((albumId: string | undefined): AiSettings => {
        const globalSettings: AiSettings = {
            customInstructions,
            keywordDenylist,
            keywordPreferredlist,
        };
        if (!albumId) return globalSettings;

        const albumOverrides = albumSettingsOverrides[albumId] || {};
        
        return {
            customInstructions: albumOverrides.customInstructions ?? globalSettings.customInstructions,
            keywordDenylist: albumOverrides.keywordDenylist ?? globalSettings.keywordDenylist,
            keywordPreferredlist: albumOverrides.keywordPreferredlist ?? globalSettings.keywordPreferredlist,
        };
    }, [customInstructions, keywordDenylist, keywordPreferredlist, albumSettingsOverrides]);

    const runAutomationForPhoto = useCallback(async (photo: Photo, aiConfig: AiSettings) => {
        if (automationMode === 'off' && !photo.isAutoProcessed) { // Allow manual batch processing in 'off' mode
            photo.isAutoProcessed = true;
        } else if(automationMode === 'off') {
            return;
        }

        addActivityLog(`Analyzing "${photo.aiData.title || 'new photo'}"...`, 'ai');
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: PhotoStatus.ANALYZING } : p));

        try {
            const aiData = await generatePhotoMetadata(
                photo.imageUrl,
                aiConfig.customInstructions,
                aiConfig.keywordDenylist,
                aiConfig.keywordPreferredlist
            );
            
            const analyzedPhoto: Photo = { ...photo, aiData, status: PhotoStatus.ANALYZED, isAutoProcessed: true };
            
            setPhotos(prev => prev.map(p => p.id === photo.id ? analyzedPhoto : p));
            addActivityLog(`Analysis complete for "${aiData.title}".`, 'success');

            if (automationMode === 'full') {
                await new Promise(res => setTimeout(res, 500));
                await handleUpdatePhotoMetadata(analyzedPhoto, aiData);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Automation failed';
            const failedPhotoUpdate = { ...photo, status: PhotoStatus.ERROR, error: `AI Automation Failed: ${errorMessage}`, errorContext: 'analysis' as const };
            setPhotos(prev => prev.map(p => p.id === photo.id ? failedPhotoUpdate : p));
            addActivityLog(`AI analysis failed for "${photo.aiData.title}".`, 'error');
            handleApiError(e, `AI Automation for ${photo.aiData.title}`);
        }
    }, [automationMode, addActivityLog, handleApiError]);
    
    // --- Centralized Data Action Handlers ---
    const handleUpdatePhotoMetadata = useCallback(async (photo: Photo, data: AiData) => {
        addActivityLog(`Saving metadata for "${data.title}"...`, 'smugmug');
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: PhotoStatus.UPDATING, error: null, errorContext: undefined } : p));
        try {
            await smugmugService.updatePhotoMetadata(photo.uri, data);
            const updatedPhoto: Photo = { ...photo, status: PhotoStatus.UPDATED, aiData: data, isAutoProcessed: false, error: null, errorContext: undefined };
            setPhotos(prev => prev.map(p => p.id === photo.id ? updatedPhoto : p));
            addActivityLog(`Successfully saved "${data.title}"!`, 'success');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown API error';
            const failedPhoto = { ...photo, aiData: data, status: PhotoStatus.ERROR, error: `SmugMug update failed: ${errorMessage}`, errorContext: 'update' as const };
            setPhotos(prev => prev.map(p => p.id === photo.id ? failedPhoto : p));
            addActivityLog(`Failed to save metadata for "${data.title}".`, 'error');
            handleApiError(e, 'Failed to update photo metadata');
        }
    }, [addActivityLog, handleApiError]);
    
    const handleDeletePhoto = useCallback(async (photo: Photo) => {
        addActivityLog(`Deleting photo "${photo.aiData.title}"...`, 'smugmug');
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: PhotoStatus.DELETING, error: null, errorContext: undefined } : p));
        try {
            await smugmugService.deletePhoto(photo.uri);
            addActivityLog(`Successfully deleted "${photo.aiData.title}".`, 'success');
            internalHandlePhotoDelete(photo.id);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown API error';
            const failedPhoto = { ...photo, status: PhotoStatus.ERROR, error: `SmugMug delete failed: ${errorMessage}`, errorContext: 'delete' as const };
            setPhotos(prev => prev.map(p => p.id === photo.id ? failedPhoto : p));
            addActivityLog(`Failed to delete "${photo.aiData.title}".`, 'error');
            handleApiError(e, 'Failed to delete photo');
        }
    }, [addActivityLog, handleApiError]);


    const handleUpload = async (files: FileList) => {
        if (!selectedAlbum) return;
        addActivityLog(`Uploading ${files.length} photo(s) to "${selectedAlbum.name}"...`, 'upload');
        const aiConfig = getResolvedAiConfig(selectedAlbum.id);
        const tempPhotos: Photo[] = Array.from(files).map(file => ({
            id: `upload-${Date.now()}-${file.name}`,
            uri: '',
            imageUrl: URL.createObjectURL(file),
            status: PhotoStatus.UPLOADING,
            aiData: { title: file.name, description: '', keywords: [] },
            error: null,
        }));

        setPhotos(prev => [...tempPhotos, ...prev]);

        const uploadPromises = tempPhotos.map(tempPhoto => {
            const originalFile = Array.from(files).find(f => f.name === tempPhoto.aiData.title)!;
            return smugmugService.uploadPhoto(selectedAlbum.uri, originalFile)
                .then(newPhoto => {
                    setPhotos(prev => prev.map(p => p.id === tempPhoto.id ? newPhoto : p));
                    setTimeout(() => runAutomationForPhoto(newPhoto, aiConfig), 0);
                    return { status: 'fulfilled', value: newPhoto };
                })
                .catch(e => {
                    const errorMessage = e instanceof Error ? e.message : 'Upload failed';
                    setPhotos(prev => prev.map(p => p.id === tempPhoto.id ? { ...p, status: PhotoStatus.ERROR, error: errorMessage, errorContext: 'upload' } : p));
                    addActivityLog(`Failed to upload ${originalFile.name}.`, 'error');
                    handleApiError(e, `Failed to upload ${originalFile.name}`);
                    return { status: 'rejected', reason: e };
                });
        });

        const results = await Promise.allSettled(uploadPromises);
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        
        if (successCount > 0) {
            const newCount = selectedAlbum.imageCount + successCount;
            setNodeTree(prevTree => setAlbumImageCount(prevTree, selectedAlbum!.id, newCount));
            setSelectedAlbum({ ...selectedAlbum, imageCount: newCount });
            addActivityLog(`Successfully uploaded ${successCount} photo(s).`, 'success');
        }
    };

    const handleSyncAlbum = useCallback(async () => {
        if (!selectedAlbum || isLoading === 'syncing') return;
        
        const aiConfig = getResolvedAiConfig(selectedAlbum.id);
        setIsLoading('syncing');
        addActivityLog(`Syncing album "${selectedAlbum.name}"...`, 'sync');

        try {
            const fetchedPhotos = await smugmugService.fetchAlbumImages(selectedAlbum.uri);
            const currentPhotoIds = new Set(photos.map(p => p.id));
            const newPhotos = fetchedPhotos.filter(p => !currentPhotoIds.has(p.id));

            if (newPhotos.length > 0) {
                addActivityLog(`Found ${newPhotos.length} new photo(s) in "${selectedAlbum.name}".`, 'success');
                setPhotos(prev => [...newPhotos, ...prev]);
                
                const newCount = fetchedPhotos.length;
                setNodeTree(prevTree => setAlbumImageCount(prevTree, selectedAlbum.id, newCount));
                setSelectedAlbum(prev => prev ? { ...prev, imageCount: newCount } : null);
                newPhotos.forEach(photo => setTimeout(() => runAutomationForPhoto(photo, aiConfig), 0));
            } else {
                addActivityLog(`"${selectedAlbum.name}" is up to date.`, 'info');
            }
        } catch (e) {
            handleApiError(e, `Failed to sync album "${selectedAlbum.name}"`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedAlbum, isLoading, addActivityLog, photos, runAutomationForPhoto, getResolvedAiConfig, handleApiError]);

  const handleSaveGlobalSettings = (settings: AiSettings & { autoSync: boolean; syncInterval: number; }) => {
    setCustomInstructions(settings.customInstructions);
    localStorage.setItem('smugmugAiTagger_customInstructions', settings.customInstructions);
    setKeywordDenylist(settings.keywordDenylist);
    localStorage.setItem('smugmugAiTagger_keywordDenylist', settings.keywordDenylist);
    setKeywordPreferredlist(settings.keywordPreferredlist);
    localStorage.setItem('smugmugAiTagger_keywordPreferredlist', settings.keywordPreferredlist);
    setIsAutoSyncEnabled(settings.autoSync);
    localStorage.setItem('smugmugAiTagger_autoSyncEnabled', String(settings.autoSync));
    setAutoSyncInterval(settings.syncInterval);
    localStorage.setItem('smugmugAiTagger_autoSyncInterval', String(settings.syncInterval));
    setIsSettingsOpen(false);
    addActivityLog('Global AI & Sync settings saved.', 'success');
  };
  
  const handleSaveAlbumSettings = (albumId: string, settings: Partial<AiSettings>) => {
      const newOverrides = { ...albumSettingsOverrides };
      const cleanedSettings = Object.fromEntries(Object.entries(settings).filter(([_, v]) => v !== null));

      if (Object.keys(cleanedSettings).length === 0) {
          delete newOverrides[albumId];
      } else {
          newOverrides[albumId] = cleanedSettings;
      }
      setAlbumSettingsOverrides(newOverrides);
      localStorage.setItem('smugmugAiTagger_albumSettingsOverrides', JSON.stringify(newOverrides));
      setIsAlbumSettingsOpen(false);
      addActivityLog(`Album-specific AI settings saved for "${selectedAlbum?.name}".`, 'success');
  };
  
    const handleApproveAll = useCallback(async () => {
        const photosToApprove = photos.filter(p => p.status === PhotoStatus.ANALYZED && p.isAutoProcessed);
        if (photosToApprove.length === 0) return;

        addActivityLog(`Approving metadata for ${photosToApprove.length} photo(s)...`, 'smugmug');
        setPhotos(prev => prev.map(p => photosToApprove.some(pa => pa.id === p.id) ? { ...p, status: PhotoStatus.UPDATING } : p));

        const approvalPromises = photosToApprove.map(photo => 
            smugmugService.updatePhotoMetadata(photo.uri, photo.aiData)
                .then(() => ({ id: photo.id, status: 'fulfilled' as const }))
                .catch(e => ({ id: photo.id, status: 'rejected' as const, reason: e }))
        );
        const results = await Promise.all(approvalPromises);
        
        setPhotos(prev => {
            let nextPhotos = [...prev];
            results.forEach(result => {
                const photoIndex = nextPhotos.findIndex(p => p.id === result.id);
                if (photoIndex > -1) {
                    if (result.status === 'fulfilled') {
                       nextPhotos[photoIndex] = { ...nextPhotos[photoIndex], status: PhotoStatus.UPDATED, isAutoProcessed: false, error: null, errorContext: undefined };
                    } else {
                       nextPhotos[photoIndex] = { ...nextPhotos[photoIndex], status: PhotoStatus.ERROR, error: 'Approval failed during SmugMug update.', errorContext: 'update' };
                    }
                }
            });
            return nextPhotos;
        });
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        if (successCount > 0) addActivityLog(`Successfully approved ${successCount} photo(s).`, 'success');
        const failureCount = results.length - successCount;
        if (failureCount > 0) addActivityLog(`Failed to approve ${failureCount} photo(s).`, 'error');

        setViewMode('all');
    }, [photos, addActivityLog]);

    const handleRejectAll = useCallback(() => {
        const photosToReject = photos.filter(p => p.status === PhotoStatus.ANALYZED && p.isAutoProcessed);
        if (photosToReject.length === 0) return;

        setPhotos(prev => prev.map(p => {
            if (photosToReject.some(pr => pr.id === p.id)) {
                return { ...p, status: PhotoStatus.PENDING, isAutoProcessed: false, aiData: { title: p.aiData.title, description: '', keywords: [] }, error: null };
            }
            return p;
        }));
        
        addActivityLog(`Rejected ${photosToReject.length} AI suggestion(s).`, 'info');
        setViewMode('all');
    }, [photos, addActivityLog]);
    
    // --- Selection and Batch Handlers ---
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(prev => !prev);
        setSelectedPhotoIds([]); // Clear selection when toggling mode
    };
    
    const handleTogglePhotoSelection = (photoId: string) => {
        setSelectedPhotoIds(prev =>
            prev.includes(photoId)
                ? prev.filter(id => id !== photoId)
                : [...prev, photoId]
        );
    };
    
    const handleClearSelection = () => {
        setSelectedPhotoIds([]);
        setIsSelectionMode(false);
    }
    
    const handleBatchAnalyze = useCallback(async () => {
        if (!selectedAlbum || selectedPhotoIds.length === 0) return;
        const aiConfig = getResolvedAiConfig(selectedAlbum.id);
        const photosToAnalyze = photos.filter(p => selectedPhotoIds.includes(p.id));
        
        addActivityLog(`Starting batch analysis for ${photosToAnalyze.length} photo(s)...`, 'ai');
        
        const analysisPromises = photosToAnalyze.map(photo => runAutomationForPhoto(photo, aiConfig));
        await Promise.allSettled(analysisPromises);
        
        addActivityLog(`Batch analysis complete.`, 'success');
        handleClearSelection();
    }, [selectedAlbum, selectedPhotoIds, photos, getResolvedAiConfig, runAutomationForPhoto, addActivityLog]);

    const handleBatchDelete = useCallback(async () => {
        if (selectedPhotoIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedPhotoIds.length} photos? This action cannot be undone.`)) return;

        addActivityLog(`Deleting ${selectedPhotoIds.length} photo(s)...`, 'smugmug');
        const photosToDelete = photos.filter(p => selectedPhotoIds.includes(p.id));
        setPhotos(prev => prev.map(p => selectedPhotoIds.includes(p.id) ? {...p, status: PhotoStatus.DELETING} : p));
        
        const deletePromises = photosToDelete.map(photo => 
            smugmugService.deletePhoto(photo.uri)
                .then(() => ({ id: photo.id, status: 'fulfilled' as const }))
                .catch(() => ({ id: photo.id, status: 'rejected' as const }))
        );
        
        const results = await Promise.all(deletePromises);
        const successfulIds = new Set<string>();
        
        results.forEach(r => {
            if (r.status === 'fulfilled') {
                successfulIds.add(r.id);
            } else {
                setPhotos(prev => prev.map(p => p.id === r.id ? {...p, status: PhotoStatus.ERROR, error: 'Failed to delete photo.', errorContext: 'delete'} : p));
            }
        });

        if (successfulIds.size > 0) {
            setPhotos(prev => prev.filter(p => !successfulIds.has(p.id)));
            if (selectedAlbum) {
                const newCount = selectedAlbum.imageCount - successfulIds.size;
                setNodeTree(prevTree => setAlbumImageCount(prevTree, selectedAlbum.id, newCount));
                setSelectedAlbum({ ...selectedAlbum, imageCount: newCount });
            }
        }

        if (successfulIds.size > 0) addActivityLog(`Successfully deleted ${successfulIds.size} photo(s).`, 'success');
        if (results.length > successfulIds.size) addActivityLog(`Failed to delete ${results.length - successfulIds.size} photo(s).`, 'error');
        
        handleClearSelection();

    }, [selectedPhotoIds, photos, selectedAlbum, addActivityLog]);
    
    const handleRetryFailedAction = useCallback(async (photoId: string) => {
        const photo = photos.find(p => p.id === photoId);
        if (!photo || !photo.errorContext) return;
    
        addActivityLog(`Retrying action for "${photo.aiData.title}"...`, 'info');
    
        const photoToRetry = { ...photo, error: null, errorContext: undefined };
        
        switch(photo.errorContext) {
          case 'analysis':
            const aiConfig = getResolvedAiConfig(selectedAlbum?.id);
            await runAutomationForPhoto(photoToRetry, aiConfig);
            break;
          case 'update':
            await handleUpdatePhotoMetadata(photoToRetry, photo.aiData);
            break;
          case 'delete':
            await handleDeletePhoto(photoToRetry);
            break;
        }
    }, [photos, getResolvedAiConfig, runAutomationForPhoto, selectedAlbum, handleUpdatePhotoMetadata, handleDeletePhoto, addActivityLog]);

    // --- Smart Album Handler ---
    const handleCreateSmartAlbum = useCallback(async (prompt: string) => {
        try {
            addActivityLog(`Starting Smart Album creation: "${prompt}"`, 'ai');
            setSmartAlbumProcessState({ status: 'fetching', message: 'Fetching all your photos...' });

            const allUserPhotos = await smugmugService.fetchAllUserImages();
            if (allUserPhotos.length === 0) {
                setSmartAlbumProcessState({ status: 'complete', message: 'No photos found in your account.' });
                return;
            }

            setSmartAlbumProcessState({ 
                status: 'analyzing', 
                message: 'Analyzing photos with AI...',
                progress: { current: 0, total: allUserPhotos.length }
            });

            const matchingPhotos: Photo[] = [];
            const BATCH_SIZE = 5;
            for (let i = 0; i < allUserPhotos.length; i += BATCH_SIZE) {
                const batch = allUserPhotos.slice(i, i + BATCH_SIZE);
                const results = await Promise.all(
                    batch.map(p => doesImageMatchPrompt(p.imageUrl, prompt).then(isMatch => ({ photo: p, isMatch })))
                );

                results.forEach(result => {
                    if (result.isMatch) {
                        matchingPhotos.push(result.photo);
                    }
                });

                setSmartAlbumProcessState(prev => ({ 
                    ...prev,
                    progress: { current: Math.min(i + BATCH_SIZE, allUserPhotos.length), total: allUserPhotos.length }
                }));
            }
            
            addActivityLog(`AI analysis found ${matchingPhotos.length} matching photo(s).`, 'success');

            if (matchingPhotos.length === 0) {
                setSmartAlbumProcessState({ status: 'complete', message: 'No matching photos were found.' });
                return;
            }

            const albumName = `Smart Album: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}`;
            setSmartAlbumProcessState({ status: 'creating', message: `Creating album "${albumName}"...` });
            const newAlbum = await smugmugService.createAlbum({ Name: albumName, UrlName: albumName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase() });
            
            setSmartAlbumProcessState({ status: 'populating', message: `Adding ${matchingPhotos.length} photos...` });
            for (const photo of matchingPhotos) {
                await smugmugService.collectImageToAlbum(photo.uri, newAlbum.uri);
            }

            addActivityLog(`Successfully created and populated "${albumName}".`, 'success');
            setSmartAlbumProcessState({ status: 'complete', message: 'Smart Album created successfully!', newAlbum });
            await fetchNodeTree(); // Refresh album list

        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setSmartAlbumProcessState({ status: 'error', message: errorMessage });
            handleApiError(e, 'Failed to create Smart Album');
        }
    }, [addActivityLog, fetchNodeTree, handleApiError]);
    
    const handleCloseSmartAlbumModal = () => {
        setIsSmartAlbumModalOpen(false);
        setSmartAlbumProcessState({ status: 'idle', message: '' });
    }

    // --- Album Story Handlers ---
    const handleGenerateAlbumStory = useCallback(async () => {
        if (!selectedAlbum) return;
        addActivityLog(`Generating AI story for "${selectedAlbum.name}"...`, 'ai');
        setIsAlbumSettingsOpen(false); // Close the settings modal
        setIsAlbumStoryModalOpen(true);
        setAlbumStoryState({ status: 'generating', story: null, error: null });

        try {
            const story = await generateAlbumStory(photos);
            setAlbumStoryState({ status: 'ready', story, error: null });
            addActivityLog(`Successfully generated AI story for "${selectedAlbum.name}".`, 'success');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            setAlbumStoryState({ status: 'error', story: null, error: errorMessage });
            handleApiError(e, 'Failed to generate Album Story');
        }
    }, [selectedAlbum, photos, addActivityLog, handleApiError]);

    const handleApplyAlbumStory = useCallback(async (story: AlbumStory) => {
        if (!selectedAlbum) return;
        addActivityLog(`Applying AI story to "${selectedAlbum.name}"...`, 'smugmug');
        setAlbumStoryState(prev => ({ ...prev, status: 'applying' }));

        try {
            await smugmugService.updateAlbumMetadata(selectedAlbum.uri, {
                Name: story.title,
                Description: story.description,
                KeywordArray: story.keywords,
            });

            // Update local state to reflect the changes immediately
            const updatedAlbum: Album = {
                ...selectedAlbum,
                name: story.title,
                description: story.description,
                keywords: story.keywords,
            };
            
            const updateNodeTree = (nodes: SmugMugNode[]): SmugMugNode[] => {
                return nodes.map(node => {
                    if (node.uri === selectedAlbum.uri) {
                        return updatedAlbum;
                    }
                    if (node.type === 'Folder') {
                        return { ...node, children: updateNodeTree(node.children) };
                    }
                    return node;
                });
            };

            setNodeTree(prev => updateNodeTree(prev));
            setSelectedAlbum(updatedAlbum);
            
            setIsAlbumStoryModalOpen(false);
            addActivityLog(`Album "${story.title}" updated successfully.`, 'success');
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            setAlbumStoryState({ status: 'error', story, error: `Failed to apply to SmugMug: ${errorMessage}` });
            handleApiError(e, 'Failed to apply Album Story');
        }
    }, [selectedAlbum, addActivityLog, handleApiError]);

    const handleCloseAlbumStoryModal = () => {
        setIsAlbumStoryModalOpen(false);
        // Delay resetting state to allow for modal close animation
        setTimeout(() => setAlbumStoryState({ status: 'idle', story: null, error: null }), 300);
    };


  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  const photosForReview = photos.filter(p => p.status === PhotoStatus.ANALYZED && p.isAutoProcessed);
  const photosToDisplay = viewMode === 'review' ? photosForReview : photos;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col">
      <header className="bg-slate-800/70 backdrop-blur-lg border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <IconCamera className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">SmugMug API Reference</h1>
        </div>
        <div className="flex items-center gap-4">
          <AutomationControl mode={automationMode} onModeChange={setAutomationMode} />
          <div className="h-8 border-l border-slate-700"></div>
          <button onClick={() => setIsDocsModalOpen(true)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition" aria-label="Open Developer Documentation">
            <IconFileText className="w-5 h-5" />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition" aria-label="Open Global AI Settings">
            <IconSettings className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 max-w-xs bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
            <AlbumList 
                nodes={nodeTree}
                selectedAlbum={selectedAlbum}
                onSelectAlbum={handleSelectAlbum}
                onCreateAlbum={handleCreateAlbum}
                isLoading={isLoading === 'albums'}
                onOpenSmartAlbumModal={() => setIsSmartAlbumModalOpen(true)}
            />
        </aside>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
           {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">
                    <p className="font-bold">An Error Occurred</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            <ImageGrid
                photos={photosToDisplay}
                album={selectedAlbum}
                onSelectPhoto={setSelectedPhoto}
                onUpload={handleUpload}
                onSync={handleSyncAlbum}
                isLoading={isLoading}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                reviewCount={photosForReview.length}
                onApproveAll={handleApproveAll}
                onRejectAll={handleRejectAll}
                isSelectionMode={isSelectionMode}
                onToggleSelectionMode={handleToggleSelectionMode}
                selectedPhotoIds={selectedPhotoIds}
                onTogglePhotoSelection={handleTogglePhotoSelection}
                onBatchAnalyze={handleBatchAnalyze}
                onBatchDelete={handleBatchDelete}
                onClearSelection={handleClearSelection}
                onRetry={handleRetryFailedAction}
                onOpenAlbumSettings={() => setIsAlbumSettingsOpen(true)}
                onGenerateStory={handleGenerateAlbumStory}
            />
        </main>
      </div>

      {selectedPhoto && (
        <PhotoDetailModal 
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onSaveMetadata={handleUpdatePhotoMetadata}
            onDeletePhoto={handleDeletePhoto}
            onRetry={handleRetryFailedAction}
            aiConfig={getResolvedAiConfig(selectedAlbum?.id)}
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={{
            customInstructions: customInstructions,
            keywordDenylist: keywordDenylist,
            keywordPreferredlist: keywordPreferredlist,
            autoSync: isAutoSyncEnabled,
            syncInterval: autoSyncInterval,
        }}
        onSave={handleSaveGlobalSettings}
      />
      
      {isAlbumSettingsOpen && selectedAlbum && (
        <AlbumSettingsModal 
            isOpen={isAlbumSettingsOpen}
            onClose={() => setIsAlbumSettingsOpen(false)}
            album={selectedAlbum}
            onSave={handleSaveAlbumSettings}
            currentOverrides={albumSettingsOverrides[selectedAlbum.id] || {}}
            globalSettings={getResolvedAiConfig(undefined)}
            onGenerateStory={handleGenerateAlbumStory}
        />
      )}
      
      <SmartAlbumModal
        isOpen={isSmartAlbumModalOpen}
        onClose={handleCloseSmartAlbumModal}
        onStart={handleCreateSmartAlbum}
        processState={smartAlbumProcessState}
      />

      {selectedAlbum && (
        <AlbumStoryModal
            isOpen={isAlbumStoryModalOpen}
            onClose={handleCloseAlbumStoryModal}
            onApply={handleApplyAlbumStory}
            albumStoryState={albumStoryState}
            album={selectedAlbum}
        />
      )}
      
      <DocsModal isOpen={isDocsModalOpen} onClose={() => setIsDocsModalOpen(false)} />
      
      <NotificationContainer notifications={notifications} onDismiss={removeNotification} />
      
      <ActivityFeed 
        log={activityLog}
        isOpen={isActivityFeedOpen}
        onToggle={() => setIsActivityFeedOpen(prev => !prev)}
      />
    </div>
  );
};

export default App;