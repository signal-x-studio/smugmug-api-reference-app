/**
 * Custom Hook: Filter Categories
 * 
 * Generates filter categories and options from photo data.
 */

import { useMemo } from 'react';
import { Photo } from '../types';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'multi-select' | 'single-select' | 'range';
}

interface UseFilterCategoriesProps {
  photos: Photo[];
}

interface UseFilterCategoriesReturn {
  filterCategories: FilterCategory[];
}

export const useFilterCategories = ({ photos }: UseFilterCategoriesProps): UseFilterCategoriesReturn => {
  const filterCategories = useMemo<FilterCategory[]>(() => {
    if (!photos.length) return [];

    // Extract unique values with counts
    const locationCounts = new Map<string, number>();
    const objectCounts = new Map<string, number>();
    const sceneCounts = new Map<string, number>();
    const cameraCounts = new Map<string, number>();
    const keywordCounts = new Map<string, number>();

    photos.forEach(photo => {
      if (photo.metadata?.location) {
        locationCounts.set(
          photo.metadata.location,
          (locationCounts.get(photo.metadata.location) || 0) + 1
        );
      }

      photo.metadata?.objects?.forEach(object => {
        objectCounts.set(object, (objectCounts.get(object) || 0) + 1);
      });

      photo.metadata?.scenes?.forEach(scene => {
        sceneCounts.set(scene, (sceneCounts.get(scene) || 0) + 1);
      });

      if (photo.metadata?.camera) {
        cameraCounts.set(
          photo.metadata.camera,
          (cameraCounts.get(photo.metadata.camera) || 0) + 1
        );
      }

      photo.metadata?.keywords?.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    // Convert to filter options
    const createOptions = (countMap: Map<string, number>): FilterOption[] =>
      Array.from(countMap)
        .sort(([, a], [, b]) => b - a) // Sort by count descending
        .slice(0, 20) // Limit to top 20
        .map(([value, count]) => ({ value, label: value, count }));

    return [
      {
        id: 'location',
        label: 'Location',
        options: createOptions(locationCounts),
        type: 'single-select' as const
      },
      {
        id: 'objects',
        label: 'Objects',
        options: createOptions(objectCounts),
        type: 'multi-select' as const
      },
      {
        id: 'scenes',
        label: 'Scenes',
        options: createOptions(sceneCounts),
        type: 'multi-select' as const
      },
      {
        id: 'camera',
        label: 'Camera',
        options: createOptions(cameraCounts),
        type: 'single-select' as const
      },
      {
        id: 'keywords',
        label: 'Keywords',
        options: createOptions(keywordCounts),
        type: 'multi-select' as const
      }
    ].filter(category => category.options.length > 0);
  }, [photos]);

  return { filterCategories };
};