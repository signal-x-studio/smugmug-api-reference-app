/**
 * Tests for Advanced Filter Interface Components
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  FilterPanel,
  SearchInterface,
  QueryBuilder,
  FilterState,
  FilterCombination
} from '../FilterPanel';
import { SemanticSearchEngine } from '../../utils/agent-native/semantic-search-engine';
import { Photo } from '../../types';

// Mock the search engine
vi.mock('../../utils/agent-native/semantic-search-engine');

describe('Advanced Filter Interface', () => {
  let mockPhotos: Photo[];
  let mockSearchEngine: SemanticSearchEngine;

  beforeEach(() => {
    const mockPhotos: Photo[] = [
      {
        id: 'photo-1',
        uri: '/api/photo-1',
        imageUrl: '/images/sunset-beach.jpg',
        status: 'ANALYZED' as any,
        aiData: { title: 'Sunset Beach', description: 'Beautiful sunset', keywords: ['sunset', 'beach'] },
        error: null,
        filename: 'sunset-beach.jpg',
        metadata: {
          keywords: ['sunset', 'beach'],
          objects: ['beach', 'waves'],
          scenes: ['sunset'],
          location: 'Hawaii',
          camera: 'Canon EOS R5',
          takenAt: new Date('2023-08-15'),
          confidence: 0.95
        }
      },
      {
        id: 'photo-2',
        uri: '/api/photo-2',
        imageUrl: '/images/family-park.jpg',
        status: 'ANALYZED' as any,
        aiData: { title: 'Family Park', description: 'Family at park', keywords: ['family', 'park'] },
        error: null,
        filename: 'family-park.jpg',
        metadata: {
          keywords: ['family', 'park'],
          objects: ['people', 'trees'],
          scenes: ['park'],
          location: 'Central Park',
          camera: 'Nikon D850',
          takenAt: new Date('2023-09-10'),
          confidence: 0.88
        }
      }
    ];

    mockSearchEngine = new SemanticSearchEngine({
      performanceThreshold: 3000,
      maxResults: 50,
      fuzzyMatchThreshold: 0.6
    });
  });

  describe('FilterPanel Component', () => {
    test('should render all filter categories', () => {
      render(<FilterPanel photos={mockPhotos} onFilterChange={vi.fn()} />);
      
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Camera')).toBeInTheDocument();
      expect(screen.getByText('Keywords')).toBeInTheDocument();
      expect(screen.getByText('Objects')).toBeInTheDocument();
      expect(screen.getByText('Scenes')).toBeInTheDocument();
    });

    test('should generate dynamic filter options from photo collection', () => {
      render(<FilterPanel photos={mockPhotos} onFilterChange={vi.fn()} />);
      
      // Check that location options are generated from photos
      fireEvent.click(screen.getByText('Location'));
      expect(screen.getByText('Hawaii')).toBeInTheDocument();
      expect(screen.getByText('Central Park')).toBeInTheDocument();
      
      // Check camera options
      fireEvent.click(screen.getByText('Camera'));
      expect(screen.getByText('Canon EOS R5')).toBeInTheDocument();
      expect(screen.getByText('Nikon D850')).toBeInTheDocument();
    });

    test('should handle filter selection and emit changes', async () => {
      const onFilterChange = vi.fn();
      render(<FilterPanel photos={mockPhotos} onFilterChange={onFilterChange} />);
      
      // Select location filter
      fireEvent.click(screen.getByText('Location'));
      fireEvent.click(screen.getByText('Hawaii'));
      
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith({
          spatial: { location: 'Hawaii' },
          temporal: {},
          semantic: {},
          people: {},
          technical: {}
        });
      });
    });

    test('should support multiple filter selections', async () => {
      const onFilterChange = vi.fn();
      render(<FilterPanel photos={mockPhotos} onFilterChange={onFilterChange} />);
      
      // Select multiple filters
      fireEvent.click(screen.getByText('Location'));
      fireEvent.click(screen.getByText('Hawaii'));
      
      fireEvent.click(screen.getByText('Objects'));  
      fireEvent.click(screen.getByText('ocean'));
      
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenLastCalledWith({
          spatial: { location: 'Hawaii' },
          semantic: { objects: ['ocean'] },
          temporal: {},
          people: {},
          technical: {}
        });
      });
    });

    test('should show result count for each filter option', () => {
      render(<FilterPanel photos={mockPhotos} onFilterChange={vi.fn()} />);
      
      fireEvent.click(screen.getByText('Location'));
      expect(screen.getByText('Hawaii (1)')).toBeInTheDocument();
      expect(screen.getByText('Central Park (1)')).toBeInTheDocument();
    });

    test('should support filter combination logic (AND/OR)', async () => {
      const onFilterChange = vi.fn();
      render(
        <FilterPanel 
          photos={mockPhotos} 
          onFilterChange={onFilterChange}
          combinationMode="AND"
        />
      );
      
      // Toggle to OR mode
      fireEvent.click(screen.getByText('AND'));
      expect(screen.getByText('OR')).toBeInTheDocument();
      
      // Select filters in OR mode
      fireEvent.click(screen.getByText('Location'));
      fireEvent.click(screen.getByText('Hawaii'));
      
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            spatial: { location: 'Hawaii' }
          }),
          'OR'
        );
      });
    });
  });

  describe('Date Range Filter', () => {
    test('should render date range picker', () => {
      render(<FilterPanel photos={mockPhotos} onFilterChange={vi.fn()} />);
      
      fireEvent.click(screen.getByText('Date Range'));
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    test('should handle date range selection', async () => {
      const onFilterChange = vi.fn();
      render(<FilterPanel photos={mockPhotos} onFilterChange={onFilterChange} />);
      
      fireEvent.click(screen.getByText('Date Range'));
      
      const startDate = screen.getByLabelText('Start Date');
      const endDate = screen.getByLabelText('End Date');
      
      fireEvent.change(startDate, { target: { value: '2023-07-01' } });
      fireEvent.change(endDate, { target: { value: '2023-07-31' } });
      
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith({
          temporal: {
            date_range: {
              start: new Date('2023-07-01'),
              end: new Date('2023-07-31')
            }
          },
          spatial: {},
          semantic: {},
          people: {},
          technical: {}
        });
      });
    });

    test('should provide quick date presets', () => {
      render(<FilterPanel photos={mockPhotos} onFilterChange={vi.fn()} />);
      
      fireEvent.click(screen.getByText('Date Range'));
      expect(screen.getByText('Last Week')).toBeInTheDocument();
      expect(screen.getByText('Last Month')).toBeInTheDocument();
      expect(screen.getByText('Last Year')).toBeInTheDocument();
    });
  });

  describe('SearchInterface Component', () => {
    test('should render search input with natural language processing', () => {
      render(<SearchInterface onSearch={vi.fn()} />);
      
      expect(screen.getByPlaceholderText('Search photos with natural language...')).toBeInTheDocument();
      expect(screen.getByText('🔍')).toBeInTheDocument();
    });

    test('should handle natural language queries', async () => {
      const onSearch = vi.fn();
      render(<SearchInterface onSearch={onSearch} />);
      
      const input = screen.getByPlaceholderText('Search photos with natural language...');
      fireEvent.change(input, { target: { value: 'sunset photos from Hawaii' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('sunset photos from Hawaii');
      });
    });

    test('should show search suggestions', async () => {
      render(<SearchInterface onSearch={vi.fn()} />);
      
      const input = screen.getByPlaceholderText('Search photos with natural language...');
      fireEvent.change(input, { target: { value: 'sun' } });
      
      await waitFor(() => {
        expect(screen.getByText('sunset photos')).toBeInTheDocument();
        expect(screen.getByText('sunny day')).toBeInTheDocument();
      });
    });

    test('should integrate with query parser for real-time feedback', async () => {
      render(<SearchInterface onSearch={vi.fn()} />);
      
      const input = screen.getByPlaceholderText('Search photos with natural language...');
      fireEvent.change(input, { target: { value: 'photos from paris' } });
      
      // Should show parsed entities
      await waitFor(() => {
        expect(screen.getByText('📍 Paris')).toBeInTheDocument();
      });
    });
  });

  describe('QueryBuilder Component', () => {
    test('should render visual query builder', () => {
      render(<QueryBuilder onQueryChange={vi.fn()} />);
      
      expect(screen.getByText('Add Filter')).toBeInTheDocument();
      expect(screen.getByText('Query Preview')).toBeInTheDocument();
    });

    test('should allow adding filter conditions', async () => {
      const onQueryChange = vi.fn();
      render(<QueryBuilder onQueryChange={onQueryChange} />);
      
      fireEvent.click(screen.getByText('Add Filter'));
      fireEvent.click(screen.getByText('Location'));
      
      const locationInput = screen.getByPlaceholderText('Enter location...');
      fireEvent.change(locationInput, { target: { value: 'Paris' } });
      
      await waitFor(() => {
        expect(onQueryChange).toHaveBeenCalledWith({
          conditions: [
            { field: 'location', operator: 'equals', value: 'Paris' }
          ],
          logic: 'AND'
        });
      });
    });

    test('should support different operators', () => {
      render(<QueryBuilder onQueryChange={vi.fn()} />);
      
      fireEvent.click(screen.getByText('Add Filter'));
      fireEvent.click(screen.getByText('Date'));
      
      expect(screen.getByText('equals')).toBeInTheDocument();
      expect(screen.getByText('before')).toBeInTheDocument();
      expect(screen.getByText('after')).toBeInTheDocument();
      expect(screen.getByText('between')).toBeInTheDocument();
    });

    test('should show visual query preview', async () => {
      render(<QueryBuilder onQueryChange={vi.fn()} />);
      
      fireEvent.click(screen.getByText('Add Filter'));
      fireEvent.click(screen.getByText('Location'));
      
      const locationInput = screen.getByPlaceholderText('Enter location...');
      fireEvent.change(locationInput, { target: { value: 'Paris' } });
      
      await waitFor(() => {
        expect(screen.getByText('Location equals "Paris"')).toBeInTheDocument();
      });
    });
  });

  describe('Filter State Management', () => {
    test('should persist filter state across sessions', () => {
      // Mock localStorage
      const mockStorage = {
        getItem: vi.fn().mockReturnValue('{"spatial":{"location":"Hawaii"}}'),
        setItem: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockStorage });
      
      const onFilterChange = vi.fn();
      render(<FilterPanel photos={mockPhotos} onFilterChange={onFilterChange} persistState={true} />);
      
      // Should load saved state
      expect(mockStorage.getItem).toHaveBeenCalledWith('photo-search-filters');
      
      // Change filter - should save state
      fireEvent.click(screen.getByText('Location'));
      fireEvent.click(screen.getByText('Central Park'));
      
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'photo-search-filters',
        expect.stringContaining('Central Park')
      );
    });

    test('should handle filter reset', () => {
      const onFilterChange = vi.fn();
      render(<FilterPanel photos={mockPhotos} onFilterChange={onFilterChange} />);
      
      // Add some filters
      fireEvent.click(screen.getByText('Location'));
      fireEvent.click(screen.getByText('Hawaii'));
      
      // Reset filters
      fireEvent.click(screen.getByText('Clear All'));
      
      expect(onFilterChange).toHaveBeenLastCalledWith({
        spatial: {},
        temporal: {},
        semantic: {},
        people: {},
        technical: {}
      });
    });
  });

  describe('Real-time Result Updates', () => {
    test('should debounce filter changes for performance', async () => {
      const onFilterChange = vi.fn();
      render(<FilterPanel photos={mockPhotos} onFilterChange={onFilterChange} debounceMs={300} />);
      
      // Rapid filter changes
      fireEvent.click(screen.getByText('Location'));
      fireEvent.click(screen.getByText('Hawaii'));
      fireEvent.click(screen.getByText('Central Park'));
      
      // Should only call once after debounce
      expect(onFilterChange).toHaveBeenCalledTimes(1);
      
      await new Promise(resolve => setTimeout(resolve, 350));
      expect(onFilterChange).toHaveBeenCalledTimes(2);
    });

    test('should show loading state during search', async () => {
      render(
        <FilterPanel 
          photos={mockPhotos} 
          onFilterChange={vi.fn()} 
          isSearching={true}
        />
      );
      
      expect(screen.getByText('Searching...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('should show result count and performance metrics', () => {
      render(
        <FilterPanel 
          photos={mockPhotos} 
          onFilterChange={vi.fn()}
          searchResults={{
            totalCount: 42,
            searchTime: 1200
          }}
        />
      );
      
      expect(screen.getByText('42 photos found')).toBeInTheDocument();
      expect(screen.getByText('1.2s')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    test('should render compact mode on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(<FilterPanel photos={mockPhotos} onFilterChange={vi.fn()} />);
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Toggle filters' })).toBeInTheDocument();
    });

    test('should support touch gestures for filter selection', () => {
      render(<FilterPanel photos={mockPhotos} onFilterChange={vi.fn()} />);
      
      const locationFilter = screen.getByText('Location');
      
      // Test touch events
      fireEvent.touchStart(locationFilter);
      fireEvent.touchEnd(locationFilter);
      
      expect(screen.getByText('Hawaii')).toBeInTheDocument();
    });
  });

  describe('Integration with Semantic Search', () => {
    test('should integrate filter results with semantic search', async () => {
      const mockSearchResults = {
        photos: [{
          ...mockPhotos[0],
          relevanceScore: 0.95,
          matchedCriteria: ['tags'],
          highlightedFields: { tags: 'test' }
        }],
        totalCount: 1,
        searchTime: 850,
        query: { 
          semantic: { 
            objects: ['test'] 
          } 
        },
        searchMetadata: {
          appliedFilters: { 
            semantic: { 
              objects: ['test'] 
            } 
          },
          matchedCriteria: ['tags'],
          performanceMetrics: {
            indexLookupTime: 10,
            fuzzyMatchTime: 5,
            sortingTime: 2,
            totalSearchTime: 850
          }
        }
      };
      
      vi.mocked(mockSearchEngine.search).mockResolvedValue(mockSearchResults);
      
      render(
        <FilterPanel 
          photos={mockPhotos}
          searchEngine={mockSearchEngine}
          onFilterChange={vi.fn()}
        />
      );
      
      fireEvent.click(screen.getByText('Location'));
      fireEvent.click(screen.getByText('Hawaii'));
      
      await waitFor(() => {
        expect(mockSearchEngine.search).toHaveBeenCalledWith({
          spatial: { location: 'Hawaii' },
          semantic: {},
          temporal: {},
          people: {}
        });
      });
    });
  });
});