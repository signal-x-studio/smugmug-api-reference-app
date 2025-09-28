/**
 * Tests for Bulk Selection & Operations Components
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  BulkOperationsPanel,
  ResultsGrid,
  BulkSelectionManager,
  BulkOperationExecutor,
  OperationConfirmationDialog
} from '../BulkOperations';
import { Photo } from '../../types';

// Mock dependencies
vi.mock('../../utils/agent-native/semantic-search-engine');

describe('Bulk Selection & Operations', () => {
  let mockPhotos: Photo[];
  let mockOnSelectionChange: ReturnType<typeof vi.fn>;
  let mockOnOperationExecute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPhotos = [
      {
        id: 'photo-1',
        filename: 'sunset-beach.jpg',
        metadata: {
          keywords: ['sunset', 'beach', 'vacation'],
          objects: ['ocean', 'sky'],
          scenes: ['landscape'],
          location: 'Hawaii',
          camera: 'Canon EOS R5',
          takenAt: new Date('2023-07-15T19:30:00Z'),
          confidence: 0.95
        }
      },
      {
        id: 'photo-2', 
        filename: 'family-park.jpg',
        metadata: {
          keywords: ['family', 'children', 'park'],
          objects: ['people', 'trees'],
          scenes: ['portrait'],
          location: 'Central Park',
          camera: 'Nikon D850',
          takenAt: new Date('2023-08-20T14:15:00Z'),
          confidence: 0.88
        }
      },
      {
        id: 'photo-3',
        filename: 'mountain-view.jpg',
        metadata: {
          keywords: ['mountain', 'landscape', 'nature'],
          objects: ['mountains', 'trees'],
          scenes: ['landscape'],
          location: 'Colorado',
          camera: 'Sony A7R IV',
          takenAt: new Date('2023-09-10T10:20:00Z'),
          confidence: 0.92
        }
      }
    ];

    mockOnSelectionChange = vi.fn();
    mockOnOperationExecute = vi.fn();
  });

  describe('Multi-Select Functionality', () => {
    test('should render photo grid with selection capability', () => {
      render(
        <ResultsGrid 
          photos={mockPhotos}
          selectionMode={true}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );
      
      expect(screen.getByText('sunset-beach.jpg')).toBeInTheDocument();
      expect(screen.getByText('family-park.jpg')).toBeInTheDocument();
      expect(screen.getByText('mountain-view.jpg')).toBeInTheDocument();
      
      // Check for selection checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    test('should handle individual photo selection', () => {
      render(
        <ResultsGrid 
          photos={mockPhotos}
          selectionMode={true}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(firstCheckbox);
      
      expect(mockOnSelectionChange).toHaveBeenCalledWith(['photo-1']);
    });

    test('should support select all functionality', () => {
      render(
        <ResultsGrid 
          photos={mockPhotos}
          selectionMode={true}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
          showSelectAll={true}
        />
      );
      
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);
      
      expect(mockOnSelectionChange).toHaveBeenCalledWith(['photo-1', 'photo-2', 'photo-3']);
    });

    test('should support select none functionality', () => {
      render(
        <ResultsGrid 
          photos={mockPhotos}
          selectionMode={true}
          selectedIds={['photo-1', 'photo-2']}
          onSelectionChange={mockOnSelectionChange}
          showSelectAll={true}
        />
      );
      
      const selectNoneButton = screen.getByText('Select None');
      fireEvent.click(selectNoneButton);
      
      expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
    });

    test('should support keyboard navigation for selection', () => {
      render(
        <ResultsGrid 
          photos={mockPhotos}
          selectionMode={true}
          selectedIds={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );
      
      const firstPhoto = screen.getByTestId('photo-photo-1');
      
      // Simulate keyboard selection
      fireEvent.keyDown(firstPhoto, { key: ' ' });
      expect(mockOnSelectionChange).toHaveBeenCalledWith(['photo-1']);
      
      // Ctrl+click simulation for multi-select
      fireEvent.keyDown(firstPhoto, { key: ' ', ctrlKey: true });
      expect(mockOnSelectionChange).toHaveBeenCalled();
    });

    test('should show selection count and statistics', () => {
      render(
        <ResultsGrid 
          photos={mockPhotos}
          selectionMode={true}
          selectedIds={['photo-1', 'photo-3']}
          onSelectionChange={mockOnSelectionChange}
          showSelectionStats={true}
        />
      );
      
      expect(screen.getByText('2 photos selected')).toBeInTheDocument();
      expect(screen.getByText('Total size: ~4.2 MB')).toBeInTheDocument();
    });
  });

  describe('Bulk Operations Panel', () => {
    test('should render available bulk operations', () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos.slice(0, 2)}
          onOperationExecute={mockOnOperationExecute}
        />
      );
      
      expect(screen.getByText('Download Selected')).toBeInTheDocument();
      expect(screen.getByText('Add to Album')).toBeInTheDocument();
      expect(screen.getByText('Export Metadata')).toBeInTheDocument();
      expect(screen.getByText('Analyze Photos')).toBeInTheDocument();
      expect(screen.getByText('Tag Photos')).toBeInTheDocument();
    });

    test('should show operation availability based on selection', () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
        />
      );
      
      // All operations should be available for valid selection
      expect(screen.getByText('Download Selected')).not.toHaveAttribute('disabled');
      expect(screen.getByText('Add to Album')).not.toHaveAttribute('disabled');
    });

    test('should disable operations when no photos selected', () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={[]}
          onOperationExecute={mockOnOperationExecute}
        />
      );
      
      expect(screen.getByText('Download Selected')).toHaveAttribute('disabled');
      expect(screen.getByText('Add to Album')).toHaveAttribute('disabled');
    });

    test('should show operation progress indicators', () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos.slice(0, 2)}
          onOperationExecute={mockOnOperationExecute}
          operationProgress={{
            operation: 'download',
            progress: 0.6,
            currentFile: 'sunset-beach.jpg'
          }}
        />
      );
      
      expect(screen.getByText('Downloading... 60%')).toBeInTheDocument();
      expect(screen.getByText('Current: sunset-beach.jpg')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('value', '60');
    });
  });

  describe('Operation Confirmation Workflows', () => {
    test('should show confirmation dialog for destructive operations', async () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
        />
      );
      
      const deleteButton = screen.getByText('Delete Selected');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete 3 photos?')).toBeInTheDocument();
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
      });
    });

    test('should handle confirmation dialog acceptance', async () => {
      render(
        <OperationConfirmationDialog 
          operation={{
            type: 'delete',
            photoCount: 2,
            destructive: true
          }}
          onConfirm={mockOnOperationExecute}
          onCancel={vi.fn()}
        />
      );
      
      const confirmButton = screen.getByText('Delete Photos');
      fireEvent.click(confirmButton);
      
      expect(mockOnOperationExecute).toHaveBeenCalledWith({
        type: 'delete',
        confirmed: true
      });
    });

    test('should handle confirmation dialog cancellation', () => {
      const mockOnCancel = vi.fn();
      
      render(
        <OperationConfirmationDialog 
          operation={{
            type: 'delete',
            photoCount: 2,
            destructive: true
          }}
          onConfirm={mockOnOperationExecute}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockOnOperationExecute).not.toHaveBeenCalled();
    });

    test('should support operation previews before confirmation', () => {
      render(
        <OperationConfirmationDialog 
          operation={{
            type: 'tag',
            photoCount: 3,
            preview: {
              existingTags: ['landscape', 'vacation'],
              newTags: ['reviewed', 'processed'],
              changes: 'Adding 2 tags to 3 photos'
            }
          }}
          onConfirm={mockOnOperationExecute}
          onCancel={vi.fn()}
        />
      );
      
      expect(screen.getByText('Operation Preview')).toBeInTheDocument();
      expect(screen.getByText('Adding 2 tags to 3 photos')).toBeInTheDocument();
      expect(screen.getByText('reviewed')).toBeInTheDocument();
      expect(screen.getByText('processed')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Rollback', () => {
    test('should handle operation failures gracefully', async () => {
      const mockExecutor = new BulkOperationExecutor();
      
      // Mock a failing operation
      mockExecutor.execute = vi.fn().mockRejectedValue(new Error('Network error'));
      
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
          executor={mockExecutor}
        />
      );
      
      const downloadButton = screen.getByText('Download Selected');
      fireEvent.click(downloadButton);
      
      await waitFor(() => {
        expect(screen.getByText('Operation Failed')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    test('should support partial operation rollback', async () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
          operationStatus={{
            type: 'tag',
            status: 'partial_failure',
            completed: 2,
            failed: 1,
            errors: [{ photoId: 'photo-3', error: 'Permission denied' }]
          }}
        />
      );
      
      expect(screen.getByText('Partial Success')).toBeInTheDocument();
      expect(screen.getByText('2 of 3 photos processed')).toBeInTheDocument();
      expect(screen.getByText('Rollback Changes')).toBeInTheDocument();
      expect(screen.getByText('Retry Failed')).toBeInTheDocument();
    });

    test('should track operation history for rollback', () => {
      const mockManager = new BulkSelectionManager();
      
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
          selectionManager={mockManager}
          showOperationHistory={true}
        />
      );
      
      expect(screen.getByText('Recent Operations')).toBeInTheDocument();
      // Would show list of recent operations with rollback options
    });

    test('should validate operations before execution', () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
          validation={{
            maxPhotos: 1000,
            maxFileSize: '100MB',
            allowedFormats: ['jpg', 'png', 'tiff']
          }}
        />
      );
      
      // Should show validation warnings if limits exceeded
      expect(screen.getByText('3 photos selected')).toBeInTheDocument();
      // No warnings should appear for valid selection
    });
  });

  describe('Agent-Coordinated Bulk Commands', () => {
    test('should process natural language bulk commands', async () => {
      const mockProcessor = vi.fn().mockResolvedValue({
        operation: 'tag',
        parameters: { tags: ['vacation', 'family'] },
        targetPhotos: ['photo-1', 'photo-2']
      });
      
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
          commandProcessor={mockProcessor}
        />
      );
      
      const commandInput = screen.getByPlaceholderText('Type bulk operation command...');
      fireEvent.change(commandInput, { 
        target: { value: 'tag selected photos as vacation and family' }
      });
      fireEvent.keyPress(commandInput, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(mockProcessor).toHaveBeenCalledWith('tag selected photos as vacation and family');
      });
    });

    test('should show command suggestions and auto-completion', () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
          showCommandHelp={true}
        />
      );
      
      const commandInput = screen.getByPlaceholderText('Type bulk operation command...');
      fireEvent.change(commandInput, { target: { value: 'download' } });
      
      expect(screen.getByText('download all selected photos')).toBeInTheDocument();
      expect(screen.getByText('download photos to folder')).toBeInTheDocument();
      expect(screen.getByText('download as zip file')).toBeInTheDocument();
    });

    test('should integrate with agent state for context', () => {
      // Mock window.agentState
      Object.defineProperty(window, 'agentState', {
        value: {
          photoSearch: {
            lastQuery: 'beach photos',
            currentFilters: { location: 'Hawaii' }
          }
        },
        writable: true
      });
      
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
          useAgentContext={true}
        />
      );
      
      // Should show contextual operation suggestions
      expect(screen.getByText('Create "Hawaii Beach Photos" album')).toBeInTheDocument();
    });

    test('should expose bulk operations to agent state', () => {
      render(
        <BulkOperationsPanel 
          selectedPhotos={mockPhotos}
          onOperationExecute={mockOnOperationExecute}
          exposeToAgents={true}
        />
      );
      
      // Verify agent state is populated
      expect(window.agentState.bulkOperations).toBeDefined();
      expect(window.agentState.bulkOperations.selectedCount).toBe(3);
      expect(window.agentState.bulkOperations.availableOperations).toContain('download');
    });
  });

  describe('Natural Language Command Processing', () => {
    test('should parse download commands', async () => {
      const processor = new BulkOperationExecutor();
      
      const result = await processor.parseCommand('download all selected photos as zip');
      
      expect(result).toEqual({
        operation: 'download',
        parameters: {
          format: 'zip',
          target: 'selected'
        },
        confidence: expect.any(Number)
      });
    });

    test('should parse tagging commands', async () => {
      const processor = new BulkOperationExecutor();
      
      const result = await processor.parseCommand('add tags landscape and nature to these photos');
      
      expect(result).toEqual({
        operation: 'tag',
        parameters: {
          tags: ['landscape', 'nature'],
          action: 'add'
        },
        confidence: expect.any(Number)
      });
    });

    test('should parse album operations', async () => {
      const processor = new BulkOperationExecutor();
      
      const result = await processor.parseCommand('create new album called Summer Vacation with selected photos');
      
      expect(result).toEqual({
        operation: 'album_create',
        parameters: {
          albumName: 'Summer Vacation',
          addPhotos: true
        },
        confidence: expect.any(Number)
      });
    });

    test('should handle ambiguous commands', async () => {
      const processor = new BulkOperationExecutor();
      
      const result = await processor.parseCommand('do something with these photos');
      
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.suggestions).toContain('download selected photos');
      expect(result.suggestions).toContain('add tags to photos');
      expect(result.suggestions).toContain('create album with photos');
    });

    test('should integrate with existing query context', async () => {
      const processor = new BulkOperationExecutor();
      processor.setContext({
        lastQuery: 'sunset beach photos',
        currentLocation: 'Hawaii'
      });
      
      const result = await processor.parseCommand('tag these as vacation photos');
      
      expect(result.parameters.suggestedTags).toContain('vacation');
      expect(result.parameters.suggestedTags).toContain('Hawaii');
      expect(result.parameters.suggestedTags).toContain('beach');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large photo selections efficiently', () => {
      const largePhotoSet = Array(1000).fill(0).map((_, i) => ({
        ...mockPhotos[0],
        id: `photo-${i}`,
        filename: `photo${i}.jpg`
      }));
      
      const startTime = Date.now();
      
      render(
        <BulkOperationsPanel 
          selectedPhotos={largePhotoSet}
          onOperationExecute={mockOnOperationExecute}
        />
      );
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
      
      expect(screen.getByText('1000 photos selected')).toBeInTheDocument();
    });

    test('should support batch processing for large operations', async () => {
      const processor = new BulkOperationExecutor();
      const largePhotoSet = Array(500).fill(0).map((_, i) => ({ id: `photo-${i}` }));
      
      const progressCallback = vi.fn();
      
      await processor.execute({
        operation: 'tag',
        photos: largePhotoSet,
        batchSize: 50,
        onProgress: progressCallback
      });
      
      // Should have called progress callback multiple times
      expect(progressCallback).toHaveBeenCalledTimes(10); // 500/50 = 10 batches
    });
  });
});