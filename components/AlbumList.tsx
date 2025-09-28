import React, { useState } from 'react';
import { Album, SmugMugNode } from '../types';
import { IconAlbum, IconAdd, IconFolder, IconChevronRight, IconChevronDown, IconSync, IconWand } from './Icons';
import { generateImageGallerySchema, generateAgentEntityData, generateJsonLD } from '../src/utils/agent-native/structured-data';

interface AlbumListProps {
  nodes: SmugMugNode[];
  selectedAlbum: Album | null;
  onSelectAlbum: (album: Album) => void;
  onCreateAlbum: (albumName: string) => void;
  isLoading: boolean;
  onOpenSmartAlbumModal: () => void;
}

const NodeItem: React.FC<{ 
    node: SmugMugNode; 
    onSelectAlbum: (album: Album) => void;
    selectedAlbum: Album | null;
    level: number;
}> = ({ node, onSelectAlbum, selectedAlbum, level }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (node.type === 'Album') {
        // Generate Schema.org structured data for album
        const imageGallerySchema = generateImageGallerySchema(node as Album);
        const jsonLD = generateJsonLD(imageGallerySchema);
        const agentEntityData = generateAgentEntityData('album', node.id, ['view', 'search', 'batch-process']);
        
        return (
            <article
                itemScope
                itemType="https://schema.org/ImageGallery"
                {...agentEntityData}
            >
                {/* JSON-LD Structured Data */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLD }} />
                
                {/* Schema.org microdata */}
                <meta itemProp="identifier" content={node.id} />
                <meta itemProp="name" content={node.name} />
                <meta itemProp="numberOfItems" content={node.imageCount.toString()} />
                {node.description && <meta itemProp="description" content={node.description} />}
                
                <button
                    onClick={() => onSelectAlbum(node)}
                    style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                    className={`w-full flex items-center gap-3 text-left p-2 rounded-lg transition ${
                    selectedAlbum?.id === node.id
                        ? 'bg-cyan-500 text-white shadow'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    <IconAlbum className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 truncate">
                        <p className="font-semibold" itemProp="name">{node.name}</p>
                        <p className={`text-xs ${selectedAlbum?.id === node.id ? 'text-cyan-100' : 'text-slate-400'}`}>
                            <span itemProp="numberOfItems">{node.imageCount}</span> photos
                        </p>
                    </div>
                </button>
            </article>
        );
    }
    
    // It's a Folder
    return (
        <div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                className="w-full flex items-center gap-2 text-left p-2 rounded-lg text-slate-300 hover:bg-slate-700/50"
            >
                {isExpanded ? <IconChevronDown className="w-4 h-4 flex-shrink-0"/> : <IconChevronRight className="w-4 h-4 flex-shrink-0"/>}
                <IconFolder className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold truncate">{node.name}</span>
            </button>
            {isExpanded && (
                <div className="space-y-1 mt-1">
                    {node.children.map(child => (
                        <NodeItem key={child.id} node={child} onSelectAlbum={onSelectAlbum} selectedAlbum={selectedAlbum} level={level + 1} />
                    ))}
                    {node.children.length === 0 && (
                        <p style={{ paddingLeft: `${(level + 1) * 1.5 + 2.25}rem` }} className="text-xs text-slate-500 italic py-1">Empty</p>
                    )}
                </div>
            )}
        </div>
    );
};

export const AlbumList: React.FC<AlbumListProps> = ({ nodes, selectedAlbum, onSelectAlbum, onCreateAlbum, isLoading, onOpenSmartAlbumModal }) => {
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (newAlbumName.trim()) {
      onCreateAlbum(newAlbumName.trim());
      setNewAlbumName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Albums & Folders</h2>
        {isLoading && <IconSync className="w-5 h-5 text-slate-400 animate-spin" />}
      </div>
      
      <div className="mb-4 space-y-2">
        {isCreating ? (
          <div className="bg-slate-700 p-2 rounded-lg">
            <input
              type="text"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="New album name..."
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-xs rounded bg-slate-600 hover:bg-slate-500">Cancel</button>
                <button onClick={handleCreate} className="px-3 py-1 text-xs rounded bg-cyan-500 hover:bg-cyan-600">Create</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold px-4 py-2 rounded-lg transition"
          >
            <IconAdd className="w-5 h-5" /> Create New Album
          </button>
        )}
        <button 
            onClick={onOpenSmartAlbumModal}
            className="w-full flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold px-4 py-2 rounded-lg transition"
        >
            <IconWand className="w-5 h-5" /> Create Smart Album
          </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2 -mr-2">
        {isLoading && !nodes.length && (
            [...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-700 rounded-lg animate-pulse"></div>)
        )}
        {nodes.map(node => (
            <NodeItem key={node.id} node={node} onSelectAlbum={onSelectAlbum} selectedAlbum={selectedAlbum} level={0} />
        ))}
      </div>
    </div>
  );
};