export enum PhotoStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING',
  ANALYZED = 'ANALYZED',
  UPDATING = 'UPDATING',
  UPDATED = 'UPDATED',
  UPLOADING = 'UPLOADING',
  DELETING = 'DELETING',
  ERROR = 'ERROR',
}

export interface AiData {
  title: string;
  description: string;
  keywords: string[];
}

export interface AiSettings {
  customInstructions: string;
  keywordDenylist: string;
  keywordPreferredlist: string;
}

export interface PhotoMetadata {
  keywords?: string[];
  objects?: string[];
  scenes?: string[];
  location?: string;
  people?: string[];
  takenAt?: Date;
  camera?: string;
  confidence?: number;
}

export interface Photo {
  id: string; // SmugMug ImageKey
  uri: string; // SmugMug Image API URI
  imageUrl: string;
  status: PhotoStatus;
  aiData: AiData;
  error: string | null;
  isAutoProcessed?: boolean; // Flag to track automation
  errorContext?: 'analysis' | 'update' | 'upload' | 'delete';
  
  // Extended properties for agent/search functionality
  filename?: string;
  title?: string;
  url?: string;
  thumbnailUrl?: string;
  description?: string;
  keywords?: string[];
  creator?: string;
  uploadDate?: string;
  width?: number;
  height?: number;
  metadata?: PhotoMetadata;
}

export interface Album {
    id: string;
    name: string;
    uri: string;
    description: string;
    keywords: string[];
    imageCount: number;
    type: 'Album';
}

export interface Folder {
    id: string; // NodeID
    name: string;
    uri: string; // Node URI
    type: 'Folder';
    children: SmugMugNode[];
}

export type SmugMugNode = Album | Folder;

export interface SmugMugCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export type AutomationMode = 'off' | 'monitor' | 'full';

export interface AppNotification {
  id: number;
  message: string;
  type: 'success' | 'info';
}

export interface ActivityLogEntry {
  id: number;
  timestamp: Date;
  message: string;
  type: 'sync' | 'ai' | 'upload' | 'smugmug' | 'error' | 'info' | 'success';
}

export interface Comment {
    id: string;
    text: string;
    authorName: string;
    date: string;
}

export interface SmartAlbumProcessState {
  status: 'idle' | 'fetching' | 'analyzing' | 'creating' | 'populating' | 'complete' | 'error';
  message: string;
  progress?: { current: number; total: number };
  newAlbum?: Album;
}

export interface AlbumStory {
    title: string;
    description: string;
    keywords: string[];
}

export interface AlbumStoryState {
    status: 'idle' | 'generating' | 'ready' | 'applying' | 'error';
    story: AlbumStory | null;
    error: string | null;
}