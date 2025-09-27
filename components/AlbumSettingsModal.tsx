import React, { useState, useEffect } from 'react';
import { AiSettings, Album } from '../types';
import { IconRobot, IconBookOpen } from './Icons';

interface AlbumSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  onSave: (albumId: string, settings: Partial<AiSettings>) => void;
  currentOverrides: Partial<AiSettings>;
  globalSettings: AiSettings;
  onGenerateStory: () => void;
}

type EditableSettings = {
    customInstructions: string | null;
    keywordDenylist: string | null;
    keywordPreferredlist: string | null;
};

export const AlbumSettingsModal: React.FC<AlbumSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  album,
  onSave,
  currentOverrides,
  globalSettings,
  onGenerateStory
}) => {
  const [settings, setSettings] = useState<EditableSettings>({
      customInstructions: null,
      keywordDenylist: null,
      keywordPreferredlist: null,
  });

  useEffect(() => {
    if (isOpen) {
      setSettings({
        customInstructions: currentOverrides.customInstructions ?? null,
        keywordDenylist: currentOverrides.keywordDenylist ?? null,
        keywordPreferredlist: currentOverrides.keywordPreferredlist ?? null,
      });
    }
  }, [isOpen, currentOverrides]);

  if (!isOpen) return null;
  
  const handleSave = () => {
    onSave(album.id, settings);
  };
  
  const handleSettingChange = (key: keyof EditableSettings, value: string) => {
    setSettings(prev => ({...prev, [key]: value}));
  };
  
  const handleUseGlobalToggle = (key: keyof EditableSettings) => {
    setSettings(prev => ({ ...prev, [key]: prev[key] === null ? '' : null }));
  };
  
  const renderSettingField = (
      key: keyof EditableSettings,
      label: string,
      placeholder: string,
      description: string
  ) => {
    const isUsingGlobal = settings[key] === null;
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor={`album-${key}`} className="text-lg font-semibold text-slate-200">{label}</label>
          <label className="flex items-center text-sm cursor-pointer">
            <input 
              type="checkbox"
              checked={isUsingGlobal}
              onChange={() => handleUseGlobalToggle(key)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-500 focus:ring-cyan-600"
            />
            <span className="ml-2 text-slate-400">Use Global Setting</span>
          </label>
        </div>
        <p className="text-slate-400 mb-2 text-sm">{description}</p>
        <textarea
          id={`album-${key}`}
          value={settings[key] ?? ''}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          disabled={isUsingGlobal}
          className="w-full h-24 bg-slate-900 border border-slate-600 text-slate-300 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition resize-y disabled:opacity-50 disabled:bg-slate-800"
          placeholder={isUsingGlobal ? `Global: ${globalSettings[key] || 'Not set'}` : placeholder}
          aria-label={`${label} for ${album.name}`}
        />
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-settings-title"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 id="album-settings-title" className="text-2xl font-bold text-white">Album AI Settings</h2>
          <p className="text-slate-400">For: <span className="font-semibold text-cyan-400">{album.name}</span></p>
        </div>
        
        <div className="space-y-8">
            <div className="flex items-start gap-3">
                <IconRobot className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                <div className="space-y-6 flex-grow">
                  {renderSettingField('customInstructions', 'Style Guide Override', 'e.g., Use a playful and whimsical tone.', 'Override the global style guide for this album only.')}
                  {renderSettingField('keywordDenylist', 'Keyword Denylist Override', 'e.g., sunset, water', 'Add or replace keywords to deny for this album.')}
                  {renderSettingField('keywordPreferredlist', 'Preferred Keywords Override', 'e.g., Smith Wedding, 2024 Portfolio', 'Add or replace preferred keywords for this album.')}
                </div>
            </div>
             <div className="border-t border-slate-700 my-2"></div>
            <div>
                 <div className="flex items-start gap-3">
                    <IconBookOpen className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                     <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white">AI Album Storyteller</h3>
                        <p className="text-slate-400 mb-4 text-sm">
                            Let AI analyze all photos in this album to generate a cohesive title, a narrative description, and album-level keywords to improve SEO and storytelling.
                        </p>
                        <button 
                            onClick={onGenerateStory}
                            className="flex items-center justify-center gap-2 bg-purple-500/80 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg transition shadow-lg shadow-purple-500/20"
                        >
                           <IconBookOpen className="w-5 h-5" /> Generate AI Story...
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition shadow-lg shadow-cyan-500/20">Save Album Settings</button>
        </div>
      </div>
    </div>
  );
};