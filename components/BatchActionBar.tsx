import React from 'react';
import { IconSparkles, IconTrash, IconX } from './Icons';

interface BatchActionBarProps {
  count: number;
  onAnalyze: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({ count, onAnalyze, onDelete, onClear }) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-lg shadow-2xl z-30 flex items-center gap-4 p-3 animate-slide-up">
      <p className="font-bold text-white text-lg">{count} selected</p>
      <div className="h-8 border-l border-slate-600"></div>
      <div className="flex items-center gap-2">
        <button onClick={onAnalyze} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition">
          <IconSparkles className="w-5 h-5" /> Analyze
        </button>
        <button onClick={onDelete} className="flex items-center gap-2 bg-red-900/80 hover:bg-red-800 text-red-200 font-semibold px-4 py-2 rounded-md transition">
          <IconTrash className="w-5 h-5" /> Delete
        </button>
      </div>
      <div className="h-8 border-l border-slate-600"></div>
      <button onClick={onClear} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition" aria-label="Clear selection">
        <IconX className="w-5 h-5" />
      </button>
    </div>
  );
};
