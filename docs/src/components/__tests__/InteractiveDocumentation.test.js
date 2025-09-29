import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import InteractiveAgentDemo from '../InteractiveAgentDemo';
import SchemaOrgValidator from '../SchemaOrgValidator';
import ActionRegistryExplorer from '../ActionRegistryExplorer';
import NaturalLanguageQueryTester from '../NaturalLanguageQueryTester';
import AgentPlayground from '../AgentPlayground';

describe('Interactive Documentation Components', () => {
  describe('InteractiveAgentDemo', () => {
    it('should render agent demo interface', () => {
      render(<InteractiveAgentDemo />);
      
      expect(screen.getByText('Agent-Native Architecture Demo')).toBeInTheDocument();
      expect(screen.getByText('Try interacting with this component using agent commands')).toBeInTheDocument();
    });

    it('should display available agent actions', () => {
      render(<InteractiveAgentDemo />);
      
      expect(screen.getByText('Available Agent Actions:')).toBeInTheDocument();
      expect(screen.getByText('window.agentActions')).toBeInTheDocument();
    });

    it('should show structured data output', () => {
      render(<InteractiveAgentDemo />);
      
      expect(screen.getByText('Structured Data (Schema.org):')).toBeInTheDocument();
    });

    it('should allow executing agent commands', async () => {
      render(<InteractiveAgentDemo />);
      
      const input = screen.getByPlaceholderText('Try: window.agentActions.filterPhotos({keywords: ["sunset"]})');
      const executeButton = screen.getByText('Execute');
      
      fireEvent.change(input, { 
        target: { value: 'window.agentActions.filterPhotos({keywords: ["test"]})' } 
      });
      fireEvent.click(executeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Execution Result:')).toBeInTheDocument();
      });
    });
  });

  describe('SchemaOrgValidator', () => {
    it('should render validator interface', () => {
      render(<SchemaOrgValidator />);
      
      expect(screen.getByText('Schema.org Validator')).toBeInTheDocument();
      expect(screen.getByText('Validate structured data markup')).toBeInTheDocument();
    });

    it('should accept JSON-LD input', () => {
      render(<SchemaOrgValidator />);
      
      const textarea = screen.getByPlaceholderText('Paste your JSON-LD structured data here...');
      expect(textarea).toBeInTheDocument();
    });

    it('should validate Schema.org markup', async () => {
      render(<SchemaOrgValidator />);
      
      const textarea = screen.getByPlaceholderText('Paste your JSON-LD structured data here...');
      const validateButton = screen.getByText('Validate');
      
      const validJsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Photograph',
        name: 'Test Photo'
      });
      
      fireEvent.change(textarea, { target: { value: validJsonLd } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText('✅ Valid Schema.org markup')).toBeInTheDocument();
      });
    });

    it('should show validation errors for invalid markup', async () => {
      render(<SchemaOrgValidator />);
      
      const textarea = screen.getByPlaceholderText('Paste your JSON-LD structured data here...');
      const validateButton = screen.getByText('Validate');
      
      fireEvent.change(textarea, { target: { value: '{ invalid json' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/❌ Invalid JSON/)).toBeInTheDocument();
      });
    });
  });

  describe('ActionRegistryExplorer', () => {
    it('should render action registry interface', () => {
      render(<ActionRegistryExplorer />);
      
      expect(screen.getByText('Agent Action Registry Explorer')).toBeInTheDocument();
      expect(screen.getByText('Explore and test available agent actions')).toBeInTheDocument();
    });

    it('should display available actions', () => {
      render(<ActionRegistryExplorer />);
      
      expect(screen.getByText('Available Actions')).toBeInTheDocument();
    });

    it('should allow filtering actions', async () => {
      render(<ActionRegistryExplorer />);
      
      const searchInput = screen.getByPlaceholderText('Search actions...');
      fireEvent.change(searchInput, { target: { value: 'filter' } });
      
      await waitFor(() => {
        // Should show filtered results
        expect(searchInput.value).toBe('filter');
      });
    });

    it('should allow testing individual actions', async () => {
      render(<ActionRegistryExplorer />);
      
      // Assume there's a test button for an action
      const testButton = screen.getByText('Test Action');
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(screen.getByText('Action Parameters')).toBeInTheDocument();
      });
    });
  });

  describe('NaturalLanguageQueryTester', () => {
    it('should render query tester interface', () => {
      render(<NaturalLanguageQueryTester />);
      
      expect(screen.getByText('Natural Language Query Tester')).toBeInTheDocument();
      expect(screen.getByText('Test natural language queries and see how they are interpreted')).toBeInTheDocument();
    });

    it('should accept natural language input', () => {
      render(<NaturalLanguageQueryTester />);
      
      const input = screen.getByPlaceholderText('Enter a natural language query...');
      expect(input).toBeInTheDocument();
    });

    it('should process natural language queries', async () => {
      render(<NaturalLanguageQueryTester />);
      
      const input = screen.getByPlaceholderText('Enter a natural language query...');
      const processButton = screen.getByText('Process Query');
      
      fireEvent.change(input, { target: { value: 'show me photos with sunset' } });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText('Query Analysis Results')).toBeInTheDocument();
        expect(screen.getByText('Intent:')).toBeInTheDocument();
        expect(screen.getByText('Entities:')).toBeInTheDocument();
        expect(screen.getByText('Confidence:')).toBeInTheDocument();
      });
    });

    it('should show suggested actions', async () => {
      render(<NaturalLanguageQueryTester />);
      
      const input = screen.getByPlaceholderText('Enter a natural language query...');
      const processButton = screen.getByText('Process Query');
      
      fireEvent.change(input, { target: { value: 'filter photos by keyword' } });
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByText('Suggested Actions:')).toBeInTheDocument();
      });
    });
  });

  describe('AgentPlayground', () => {
    it('should render playground interface', () => {
      render(<AgentPlayground />);
      
      expect(screen.getByText('Agent Playground')).toBeInTheDocument();
      expect(screen.getByText('Interactive environment for testing agent capabilities')).toBeInTheDocument();
    });

    it('should have multiple tabs for different features', () => {
      render(<AgentPlayground />);
      
      expect(screen.getByText('Structured Data')).toBeInTheDocument();
      expect(screen.getByText('Action Registry')).toBeInTheDocument();
      expect(screen.getByText('Natural Language')).toBeInTheDocument();
      expect(screen.getByText('Live Demo')).toBeInTheDocument();
    });

    it('should switch between tabs', () => {
      render(<AgentPlayground />);
      
      const actionTab = screen.getByText('Action Registry');
      fireEvent.click(actionTab);
      
      expect(screen.getByText('Agent Action Registry Explorer')).toBeInTheDocument();
    });

    it('should persist playground state between tabs', () => {
      render(<AgentPlayground />);
      
      // Set some state in structured data tab
      const structuredDataTab = screen.getByText('Structured Data');
      fireEvent.click(structuredDataTab);
      
      // Switch to another tab and back
      const actionTab = screen.getByText('Action Registry');
      fireEvent.click(actionTab);
      fireEvent.click(structuredDataTab);
      
      // State should be preserved
      expect(screen.getByText('Schema.org Validator')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should work with real agent infrastructure', async () => {
      // Mock agent infrastructure
      global.window = {
        agentActions: {
          filterPhotos: vi.fn().mockResolvedValue({ photos: [], count: 0 })
        },
        agentInterfaces: {
          'test-component': {
            currentState: { photos: [] },
            availableActions: []
          }
        }
      };
      
      render(<InteractiveAgentDemo />);
      
      const input = screen.getByPlaceholderText('Try: window.agentActions.filterPhotos({keywords: ["sunset"]})');
      const executeButton = screen.getByText('Execute');
      
      fireEvent.change(input, { 
        target: { value: 'window.agentActions.filterPhotos({keywords: ["test"]})' } 
      });
      fireEvent.click(executeButton);
      
      await waitFor(() => {
        expect(global.window.agentActions.filterPhotos).toHaveBeenCalled();
      });
    });

    it('should handle agent action errors gracefully', async () => {
      global.window = {
        agentActions: {
          filterPhotos: vi.fn().mockRejectedValue(new Error('Test error'))
        }
      };
      
      render(<InteractiveAgentDemo />);
      
      const input = screen.getByPlaceholderText('Try: window.agentActions.filterPhotos({keywords: ["sunset"]})');
      const executeButton = screen.getByText('Execute');
      
      fireEvent.change(input, { 
        target: { value: 'window.agentActions.filterPhotos({keywords: ["test"]})' } 
      });
      fireEvent.click(executeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });
  });
});