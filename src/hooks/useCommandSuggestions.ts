/**
 * useCommandSuggestions - Custom Hook
 * 
 * Manages command input suggestions and natural language processing
 * for bulk operations command interface.
 */

import { useEffect } from 'react';

export interface CommandSuggestionsConfig {
  commandInput: string;
  showCommandHelp: boolean;
  setCommandSuggestions: (suggestions: string[]) => void;
}

export const useCommandSuggestions = ({
  commandInput,
  showCommandHelp,
  setCommandSuggestions
}: CommandSuggestionsConfig): void => {
  
  // Generate command suggestions based on input
  useEffect(() => {
    if (showCommandHelp && commandInput.length > 2) {
      const baseSuggestions = [
        'download all selected photos',
        'download photos to folder',
        'download as zip file',
        'add tags to selected photos',
        'create album with selected photos',
        'export metadata as CSV',
        'export metadata as JSON',
        'analyze selected photos',
        'delete selected photos',
        'tag photos as vacation',
        'tag photos as family',
        'create Hawaii album',
        'download high resolution photos'
      ];

      const filteredSuggestions = baseSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(commandInput.toLowerCase())
      ).slice(0, 6); // Limit to 6 suggestions for better UX

      setCommandSuggestions(filteredSuggestions);
    } else {
      setCommandSuggestions([]);
    }
  }, [commandInput, showCommandHelp, setCommandSuggestions]);
};