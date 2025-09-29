import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  id: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, label, id }) => {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="relative">
        <input 
          id={id}
          type="checkbox" 
          className="sr-only" 
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)} 
        />
        <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-cyan-500' : 'bg-slate-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${enabled ? 'translate-x-6' : ''}`}></div>
      </div>
      {label && <div className="ml-3 text-slate-200 font-medium">{label}</div>}
    </label>
  );
};
