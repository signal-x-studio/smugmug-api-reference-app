import React from 'react';
import { AutomationMode } from '../types';
import { IconPower, IconEye, IconRobot } from './Icons';

interface AutomationControlProps {
  mode: AutomationMode;
  onModeChange: (mode: AutomationMode) => void;
}

const modes: { id: AutomationMode, label: string, icon: React.ReactNode, description: string }[] = [
    { id: 'off', label: 'Off', icon: <IconPower className="w-4 h-4" />, description: "Manual AI analysis only." },
    { id: 'monitor', label: 'Monitor', icon: <IconEye className="w-4 h-4" />, description: "Auto-analyze new uploads, but require manual save." },
    { id: 'full', label: 'Full Auto', icon: <IconRobot className="w-4 h-4" />, description: "Auto-analyze and auto-save new uploads." },
];

export const AutomationControl: React.FC<AutomationControlProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-300">AI Automation:</p>
        <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => onModeChange(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-md transition ${
                        mode === m.id
                        ? 'bg-cyan-500 text-white shadow'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                    title={m.description}
                    aria-pressed={mode === m.id}
                >
                    {m.icon}
                    {m.label}
                </button>
            ))}
        </div>
    </div>
  );
};