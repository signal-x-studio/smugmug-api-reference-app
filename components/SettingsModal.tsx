import React, { useState, useEffect } from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { IconRobot, IconSync } from './Icons';
import { AiSettings } from '../types';

type Settings = AiSettings & {
    autoSync: boolean;
    syncInterval: number;
}
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: Settings;
  onSave: (settings: Settings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentSettings,
  onSave 
}) => {
  const [settings, setSettings] = useState(currentSettings);

  useEffect(() => {
    // Reset local state when the modal is opened or props change
    if (isOpen) {
      setSettings(currentSettings);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) {
    return null;
  }
  
  const handleSave = () => {
      onSave(settings);
  };
  
  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings(prev => ({...prev, [key]: value}));
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl border border-slate-700 p-6"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-2xl font-bold text-white">AI & Sync Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none" aria-label="Close">&times;</button>
        </div>
        
        <div className="space-y-8">
          
          <div>
            <div className="flex items-center gap-3 mb-4">
                <IconRobot className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Global AI Instructions</h3>
            </div>
            <div className="space-y-6 pl-9">
              <div>
                <label htmlFor="custom-instructions" className="text-lg font-semibold text-slate-200">Style Guide</label>
                <p className="text-slate-400 mb-2 text-sm">
                  Provide guidance for the AI to tailor the generated titles and descriptions. You can specify a tone (e.g., "professional" or "creative"), ask it to focus on certain aspects, etc.
                </p>
                <textarea
                  id="custom-instructions"
                  value={settings.customInstructions}
                  onChange={(e) => handleSettingChange('customInstructions', e.target.value)}
                  className="w-full h-32 bg-slate-900 border border-slate-600 text-slate-300 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition resize-y"
                  placeholder="e.g., Write in a formal, third-person tone. Focus on the emotional impact of the scene."
                  aria-label="Custom AI Instructions"
                />
              </div>
              <div>
                <label htmlFor="keyword-denylist" className="text-lg font-semibold text-slate-200">Keyword Denylist</label>
                 <p className="text-slate-400 mb-2 text-sm">
                  Enter comma-separated keywords you never want the AI to use.
                </p>
                <textarea
                  id="keyword-denylist"
                  value={settings.keywordDenylist}
                  onChange={(e) => handleSettingChange('keywordDenylist', e.target.value)}
                  className="w-full h-24 bg-slate-900 border border-slate-600 text-slate-300 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition resize-y"
                  placeholder="e.g., person, image, beautiful, photo"
                  aria-label="Keyword denylist"
                />
              </div>
               <div>
                <label htmlFor="keyword-preferredlist" className="text-lg font-semibold text-slate-200">Preferred Keywords</label>
                <p className="text-slate-400 mb-2 text-sm">
                  Enter comma-separated keywords you want the AI to prioritize, if relevant (e.g., your studio name, a series name).
                </p>
                <textarea
                  id="keyword-preferredlist"
                  value={settings.keywordPreferredlist}
                  onChange={(e) => handleSettingChange('keywordPreferredlist', e.target.value)}
                  className="w-full h-24 bg-slate-900 border border-slate-600 text-slate-300 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition resize-y"
                  placeholder="e.g., Aperture Pro Studios, Urban Decay Series, travel photography"
                  aria-label="Preferred keywords"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 my-6"></div>

          <div>
            <div className="flex items-center gap-3 mb-4">
                <IconSync className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Synchronization</h3>
            </div>
             <div className="space-y-6 pl-9">
                 <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <div>
                        <label htmlFor="auto-sync-toggle" className="font-semibold text-slate-200 text-lg">Enable Auto-Sync</label>
                        <p className="text-slate-400 text-sm">Periodically check the selected album for new photos.</p>
                    </div>
                    <ToggleSwitch id="auto-sync-toggle" enabled={settings.autoSync} onChange={(val) => handleSettingChange('autoSync', val)} />
                 </div>
                 {settings.autoSync && (
                     <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <label htmlFor="sync-interval" className="font-semibold text-slate-200 text-lg">Sync Frequency</label>
                        <p className="text-slate-400 text-sm mb-2">How often should the app check for new photos?</p>
                        <select
                            id="sync-interval"
                            value={settings.syncInterval}
                            onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value, 10))}
                            className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                        >
                            <option value="1">Every 1 minute</option>
                            <option value="5">Every 5 minutes</option>
                            <option value="15">Every 15 minutes</option>
                        </select>
                     </div>
                 )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition shadow-lg shadow-cyan-500/20"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
