import React, { useState, KeyboardEvent } from 'react';
import { IconX } from './Icons';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({ keywords, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newKeyword = inputValue.trim();
      if (newKeyword && !keywords.includes(newKeyword)) {
        onChange([...keywords, newKeyword]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove the last keyword on backspace if input is empty
      onChange(keywords.slice(0, -1));
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    onChange(keywords.filter(keyword => keyword !== keywordToRemove));
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text');
      const pastedKeywords = pasteData.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
      if (pastedKeywords.length > 0) {
          const uniqueNewKeywords = pastedKeywords.filter(k => !keywords.includes(k));
          onChange([...keywords, ...uniqueNewKeywords]);
      }
  };

  return (
    <div className="w-full bg-slate-700/50 border-b-2 border-slate-600 focus-within:border-cyan-500 rounded-t-md p-2 flex flex-wrap gap-2 items-center transition">
      {keywords.map((keyword, index) => (
        <span key={index} className="flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 text-sm font-semibold px-2 py-1 rounded">
          {keyword}
          <button
            onClick={() => handleRemoveKeyword(keyword)}
            className="text-cyan-200 hover:text-white"
            aria-label={`Remove keyword ${keyword}`}
          >
            <IconX className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="flex-grow bg-transparent text-slate-300 text-sm outline-none p-1 min-w-[100px]"
        placeholder={keywords.length === 0 ? placeholder : "Add more..."}
      />
    </div>
  );
};