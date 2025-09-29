/**
 * Memory Leak Prevention Utilities
 * 
 * Provides AbortController support, cleanup functions, and memory management
 * utilities to prevent common React memory leaks and resource leaks.
 */

import { useEffect, useRef, useCallback } from 'react';

// =============================================================================
// ABORT CONTROLLER UTILITIES
// =============================================================================

/**
 * Hook for managing AbortController across component lifecycle
 */
export const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const createController = useCallback(() => {
    // Abort existing controller if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new controller
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);

  const getSignal = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    return abortControllerRef.current.signal;
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { createController, getSignal, abort };
};

/**
 * Hook for making cancelable async requests
 */
export const useCancelableRequest = <T = unknown>() => {
  const { createController, getSignal } = useAbortController();

  const makeRequest = useCallback(async (
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    const controller = createController();
    
    try {
      const result = await requestFn(controller.signal);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, return null
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }, [createController]);

  return { makeRequest, getSignal };
};

// =============================================================================
// CLEANUP MANAGEMENT UTILITIES
// =============================================================================

/**
 * Hook for managing multiple cleanup functions
 */
export const useCleanupManager = () => {
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.push(cleanupFn);
  }, []);

  const runCleanup = useCallback(() => {
    cleanupFunctionsRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup function failed:', error);
      }
    });
    cleanupFunctionsRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return runCleanup;
  }, [runCleanup]);

  return { addCleanup, runCleanup };
};

/**
 * Hook for managing event listeners with automatic cleanup
 */
export const useEventListener = (
  target: EventTarget | null,
  eventType: string,
  handler: EventListener,
  options?: AddEventListenerOptions
) => {
  const { addCleanup } = useCleanupManager();

  useEffect(() => {
    if (!target) return;

    target.addEventListener(eventType, handler, options);

    addCleanup(() => {
      target.removeEventListener(eventType, handler, options);
    });
  }, [target, eventType, handler, options, addCleanup]);
};

/**
 * Hook for managing timers with automatic cleanup
 */
export const useTimer = () => {
  const { addCleanup } = useCleanupManager();

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(callback, delay);
    addCleanup(() => window.clearTimeout(timerId));
    return timerId;
  }, [addCleanup]);

  const setInterval = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setInterval(callback, delay);
    addCleanup(() => window.clearInterval(timerId));
    return timerId;
  }, [addCleanup]);

  const requestAnimationFrame = useCallback((callback: FrameRequestCallback) => {
    const frameId = window.requestAnimationFrame(callback);
    addCleanup(() => window.cancelAnimationFrame(frameId));
    return frameId;
  }, [addCleanup]);

  return { setTimeout, setInterval, requestAnimationFrame };
};

// =============================================================================
// ASYNC OPERATION UTILITIES
// =============================================================================

/**
 * Wrapper for fetch requests with AbortController support
 */
export const createCancelableFetch = (signal: AbortSignal) => {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    return fetch(url, {
      ...options,
      signal
    });
  };
};

/**
 * Hook for managing async operations with cancellation
 */
export const useAsyncOperation = <T = unknown>() => {
  const { makeRequest } = useCancelableRequest<T>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    operation: (signal: AbortSignal) => Promise<T>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await makeRequest(operation);
      if (result !== null) {
        setData(result);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest]);

  return { execute, isLoading, error, data };
};

// =============================================================================
// MEMORY MANAGEMENT UTILITIES
// =============================================================================

/**
 * Hook for preventing state updates after component unmount
 */
export const useMountedRef = () => {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
};

/**
 * Safe state setter that checks if component is still mounted
 */
export const useSafeState = <T>(initialState: T): [T, (value: T) => void] => {
  const [state, setState] = useState(initialState);
  const mountedRef = useMountedRef();

  const safeSetState = useCallback((value: T) => {
    if (mountedRef.current) {
      setState(value);
    }
  }, [mountedRef]);

  return [state, safeSetState];
};

/**
 * Hook for managing WeakMap-based caches to prevent memory leaks
 */
export const useWeakCache = <K extends object, V>() => {
  const cacheRef = useRef<WeakMap<K, V>>(new WeakMap());

  const get = useCallback((key: K): V | undefined => {
    return cacheRef.current.get(key);
  }, []);

  const set = useCallback((key: K, value: V): void => {
    cacheRef.current.set(key, value);
  }, []);

  const has = useCallback((key: K): boolean => {
    return cacheRef.current.has(key);
  }, []);

  const delete_ = useCallback((key: K): boolean => {
    return cacheRef.current.delete(key);
  }, []);

  return { get, set, has, delete: delete_ };
};

// =============================================================================
// SPECIALIZED HOOKS FOR COMMON PATTERNS
// =============================================================================

/**
 * Hook for managing search operations with debouncing and cancellation
 */
export const useSearchWithCancellation = <T>(
  searchFn: (query: string, signal: AbortSignal) => Promise<T[]>,
  debounceMs = 300
) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { createController } = useAbortController();
  const { setTimeout: safeSetTimeout } = useTimer();

  const debouncedSearch = useCallback((searchQuery: string) => {
    safeSetTimeout(async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const controller = createController();

      try {
        const searchResults = await searchFn(searchQuery, controller.signal);
        setResults(searchResults);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Search failed:', error);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [searchFn, debounceMs, createController, safeSetTimeout]);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return { query, setQuery, results, isLoading };
};

/**
 * Hook for managing image loading with cancellation
 */
export const useImageLoader = () => {
  const { addCleanup } = useCleanupManager();

  const loadImage = useCallback((src: string, signal?: AbortSignal): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        resolve(img);
      };

      img.onerror = () => {
        cleanup();
        reject(new Error(`Failed to load image: ${src}`));
      };

      if (signal) {
        signal.addEventListener('abort', () => {
          cleanup();
          reject(new Error('Image loading cancelled'));
        });
      }

      addCleanup(cleanup);
      img.src = src;
    });
  }, [addCleanup]);

  return { loadImage };
};

// Import useState (missed in the imports)
import { useState } from 'react';