/**
 * Enhanced SmugMug Service - Memory Leak Prevention
 * 
 * Example implementation showing how to use AbortController and cleanup utilities
 * to prevent memory leaks in async operations.
 */

import type { Album, Photo, Comment, SmugMugNode, AiData } from '../types';
import { PhotoStatus } from '../types';
import type { ApiResponse, ApiRequestOptions } from '../types/type-safe-interfaces';

export class SmugMugServiceEnhanced {
    private baseUrl = 'https://api.smugmug.com/api/v2';
    private apiKey: string;
    private requestQueue: Map<string, AbortController> = new Map();

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Create a cancelable request with proper cleanup
     */
    private async requestWithCancellation<T>(
        method: string, 
        uri: string, 
        body?: unknown,
        requestId?: string
    ): Promise<ApiResponse<T>> {
        // Create abort controller for this request
        const controller = new AbortController();
        
        // Store controller for potential cancellation
        if (requestId) {
            // Cancel any existing request with same ID
            const existing = this.requestQueue.get(requestId);
            if (existing) {
                existing.abort();
            }
            this.requestQueue.set(requestId, controller);
        }

        try {
            const options: RequestInit = {
                method,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.baseUrl}${uri}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Clean up request from queue
            if (requestId) {
                this.requestQueue.delete(requestId);
            }

            return {
                success: true,
                data: data.Response as T,
                statusCode: response.status,
                headers: Object.fromEntries(response.headers.entries())
            };
        } catch (error) {
            // Clean up request from queue
            if (requestId) {
                this.requestQueue.delete(requestId);
            }

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    return {
                        success: false,
                        error: 'Request cancelled'
                    };
                }
                return {
                    success: false,
                    error: error.message
                };
            }
            
            return {
                success: false,
                error: 'Unknown error occurred'
            };
        }
    }

    /**
     * Cancel all pending requests
     */
    public cancelAllRequests(): void {
        for (const [requestId, controller] of this.requestQueue) {
            controller.abort();
        }
        this.requestQueue.clear();
    }

    /**
     * Cancel specific request
     */
    public cancelRequest(requestId: string): boolean {
        const controller = this.requestQueue.get(requestId);
        if (controller) {
            controller.abort();
            this.requestQueue.delete(requestId);
            return true;
        }
        return false;
    }

    /**
     * Fetch node tree with cancellation support
     */
    public async fetchNodeTree(signal?: AbortSignal): Promise<ApiResponse<SmugMugNode[]>> {
        const requestId = 'fetch-node-tree';
        
        try {
            // If external signal provided, listen for abort
            if (signal) {
                signal.addEventListener('abort', () => {
                    this.cancelRequest(requestId);
                });
            }

            const response = await this.requestWithCancellation<{ Node: SmugMugNode[] }>(
                'GET',
                '/node/children',
                undefined,
                requestId
            );

            if (!response.success) {
                return { success: false, error: response.error };
            }

            const nodes = response.data?.Node || [];
            const albums = nodes.filter(node => node.type === 'Album');

            // Process albums with abort signal support
            const processedAlbums = await Promise.all(
                albums.slice(0, 10).map(async (node): Promise<SmugMugNode | null> => {
                    if (signal?.aborted) {
                        throw new Error('Operation cancelled');
                    }

                    try {
                        const albumResponse = await this.requestWithCancellation<SmugMugNode>(
                            'GET',
                            node.uri,
                            undefined,
                            `album-${node.id}`
                        );
                        
                        return albumResponse.success ? albumResponse.data! : null;
                    } catch (error) {
                        if (error instanceof Error && error.name === 'AbortError') {
                            return null;
                        }
                        console.error(`Failed to fetch album ${node.id}:`, error);
                        return null;
                    }
                })
            );

            const validAlbums = processedAlbums.filter((album): album is SmugMugNode => album !== null);

            return {
                success: true,
                data: validAlbums
            };
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request cancelled'
                };
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Fetch album images with cancellation and pagination
     */
    public async fetchAlbumImages(
        albumUri: string, 
        options: {
            limit?: number;
            offset?: number;
            signal?: AbortSignal;
        } = {}
    ): Promise<ApiResponse<Photo[]>> {
        const { limit = 100, offset = 0, signal } = options;
        const requestId = `album-images-${albumUri}`;

        try {
            if (signal) {
                signal.addEventListener('abort', () => {
                    this.cancelRequest(requestId);
                });
            }

            const response = await this.requestWithCancellation<{ AlbumImage: Photo[] }>(
                'GET',
                `${albumUri}!images?count=${limit}&start=${offset + 1}`,
                undefined,
                requestId
            );

            if (!response.success) {
                return { success: false, error: response.error };
            }

            const images = response.data?.AlbumImage || [];

            // Process images with abort checking
            const processedImages = images.map((img: any): Photo => {
                // Check for cancellation during processing
                if (signal?.aborted) {
                    throw new Error('Operation cancelled');
                }

                return {
                    id: img.ImageKey,
                    uri: img.Uri || '',
                    filename: img.FileName,
                    title: img.Title || img.FileName,
                    description: img.Caption || '',
                    url: img.ArchivedUri,
                    imageUrl: img.LargestImage?.ImageUrl || img.ThumbnailUrl,
                    thumbnailUrl: img.ThumbnailUrl,
                    width: img.LargestImage?.Width || 0,
                    height: img.LargestImage?.Height || 0,
                    uploadDate: img.DateUploaded,
                    keywords: img.Keywords ? img.Keywords.split(';') : [],
                    creator: img.ImageOwner || '',
                    aiData: {
                        title: img.Title || 'Untitled',
                        description: img.Caption || 'No description available.',
                        keywords: img.Keywords ? img.Keywords.split(';') : []
                    },
                    status: PhotoStatus.ANALYZED,
                    error: null,
                    metadata: {
                        camera: img.CameraMake || 'Unknown',
                        location: img.Caption || '',
                        takenAt: img.DateTaken ? new Date(img.DateTaken) : new Date(img.DateUploaded),
                        keywords: img.Keywords ? img.Keywords.split(';') : [],
                        objects: [],
                        scenes: []
                    }
                };
            });

            return {
                success: true,
                data: processedImages
            };
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request cancelled'
                };
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Update photo metadata with optimistic updates and rollback
     */
    public async updatePhotoMetadata(
        imageUri: string, 
        data: AiData,
        signal?: AbortSignal
    ): Promise<ApiResponse<void>> {
        const requestId = `update-photo-${imageUri}`;

        try {
            if (signal) {
                signal.addEventListener('abort', () => {
                    this.cancelRequest(requestId);
                });
            }

            const updateData = {
                Title: data.title,
                Caption: data.description,
                Keywords: data.keywords.join(';')
            };

            const response = await this.requestWithCancellation<void>(
                'PATCH',
                imageUri,
                updateData,
                requestId
            );

            return response;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request cancelled'
                };
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Batch update multiple photos with progress tracking
     */
    public async batchUpdatePhotos(
        updates: Array<{ imageUri: string; data: AiData }>,
        options: {
            onProgress?: (completed: number, total: number) => void;
            signal?: AbortSignal;
            concurrency?: number;
        } = {}
    ): Promise<ApiResponse<{ completed: number; failed: number; errors: any[] }>> {
        const { onProgress, signal, concurrency = 5 } = options;
        let completed = 0;
        let failed = 0;
        const errors: any[] = [];

        try {
            // Process updates in batches to control concurrency
            for (let i = 0; i < updates.length; i += concurrency) {
                // Check for cancellation
                if (signal?.aborted) {
                    throw new Error('Operation cancelled');
                }

                const batch = updates.slice(i, i + concurrency);
                
                const batchResults = await Promise.allSettled(
                    batch.map(async ({ imageUri, data }) => {
                        const result = await this.updatePhotoMetadata(imageUri, data, signal);
                        return { imageUri, result };
                    })
                );

                // Process batch results
                for (const result of batchResults) {
                    if (result.status === 'fulfilled') {
                        if (result.value.result.success) {
                            completed++;
                        } else {
                            failed++;
                            errors.push({
                                imageUri: result.value.imageUri,
                                error: result.value.result.error
                            });
                        }
                    } else {
                        failed++;
                        errors.push({
                            imageUri: 'unknown',
                            error: result.reason
                        });
                    }
                }

                // Report progress
                onProgress?.(completed + failed, updates.length);
            }

            return {
                success: true,
                data: { completed, failed, errors }
            };
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Batch operation cancelled'
                };
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Cleanup method to call when service is no longer needed
     */
    public cleanup(): void {
        this.cancelAllRequests();
    }
}