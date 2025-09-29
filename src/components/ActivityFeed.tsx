import React, { useState } from 'react';
import { ActivityLogEntry } from '../types';
import { IconChevronUp, IconChevronDown, IconSync, IconRobot, IconUpload, IconCheck, IconError, IconX } from './Icons';

const ICONS: Record<ActivityLogEntry['type'], React.ReactNode> = {
  sync: <IconSync className="w-4 h-4 text-blue-400" />,
  ai: <IconRobot className="w-4 h-4 text-purple-400" />,
  upload: <IconUpload className="w-4 h-4 text-lime-400" />,
  smugmug: <IconCheck className="w-4 h-4 text-cyan-400" />,
  error: <IconError className="w-4 h-4 text-red-400" />,
  info: <IconRobot className="w-4 h-4 text-slate-400" />,
  success: <IconCheck className="w-4 h-4 text-green-400" />,
};

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

interface ActivityFeedProps {
  log: ActivityLogEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ log, isOpen, onToggle }) => {
  const latestEntry = log[0];

  return (
    <div className="fixed bottom-0 right-0 m-4 z-40 w-full max-w-md">
      <div className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out">
        <button
          onClick={onToggle}
          className="w-full p-3 text-left flex justify-between items-center hover:bg-slate-700/50"
          aria-expanded={isOpen}
          aria-controls="activity-feed-content"
        >
          <div className="flex items-center gap-3">
             <span className="flex-shrink-0">
                {latestEntry ? ICONS[latestEntry.type] : <IconRobot className="w-4 h-4 text-slate-400" />}
             </span>
             <div className="flex-1 truncate">
                 <p className="text-sm font-semibold text-white">
                    {isOpen ? 'Activity Feed' : (latestEntry?.message || 'Ready')}
                 </p>
                {!isOpen && latestEntry && (
                    <p className="text-xs text-slate-400">{formatTime(latestEntry.timestamp)}</p>
                )}
             </div>
          </div>
          {isOpen ? <IconChevronDown className="w-5 h-5 text-slate-400" /> : <IconChevronUp className="w-5 h-5 text-slate-400" />}
        </button>
        
        {isOpen && (
            <div id="activity-feed-content" className="h-64 overflow-y-auto p-3 border-t border-slate-700">
                {log.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No activities yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {log.map(entry => (
                            <li key={entry.id} className="flex items-start gap-3 text-sm">
                                <span className="mt-0.5">{ICONS[entry.type]}</span>
                                <div className="flex-1">
                                    <p className="text-slate-300">{entry.message}</p>
                                    <p className="text-xs text-slate-500">{formatTime(entry.timestamp)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}
      </div>
    </div>
  );
};