import * as React from "react";

type PromiseType<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never;

type FetchPolicy = "cache_or_network" | "cache_and_network";
type ResourceOptions = {
  fetchPolicy?: FetchPolicy;
  unstable_gcReleaseBufferMaxSize?: number;
};

export function createResource<F extends (...args: any[]) => Promise<any>>(
  fn: F,
  keyOrKeyGen: string | ((...args: Parameters<F>) => string),
  options: ResourceOptions = {}
) {
  type Value = PromiseType<ReturnType<F>>;
  type CacheRecord = Promise<void> | Value | Error;
  const cache = new Map<string, CacheRecord>();
  const refCount = new Map<string, number>();
  const gcReleaseBuffer = new Set<string>();

  const {
    fetchPolicy = "cache_or_network",
    unstable_gcReleaseBufferMaxSize: maxBufferSize = 10,
  } = options;

  /**
   * Warms up the cache.
   * 
   * Suggestion: call `prepare` before `useResource`.
   * If possible, do that in parallel with loading the UI code.
   */
  function prepare(...args: Parameters<F>) {
    const key = getKey(...args);
    const record = cache.get(key);
    if (!record || record instanceof Error) {
      const promise = resolveNetwork(key, ...args);
      cache.set(key, promise);
      return promise;
    }
    return Promise.resolve();
  }

  /**
   * Hook for consuming the resource inside a React component.
   * 
   * const [value, setValue] = MyResource.useResource();
   * 
   * Suggestion: use the updater function to perform a local mutation.
   */
  function useResource(...args: Parameters<F>) {
    const key = getKey(...args);
    const [value, setValue] = React.useState<Value>(read(key, ...args));
    const didMount = React.useRef(false);

    React.useEffect(() => {
      if (!didMount.current) {
        didMount.current = true;
        acquireLifetime(key);
        return;
      }
      cache.set(key, value);
      return () => {
        enqueueCleanup(key);
      };
    }, [key, value]);

    return [value, setValue] as const;
  }
  
  /**
   * Retrieve the current value of the cache, given some arguments.
   * 
   * Suggestion: use this to kick off a `prepare` that depends on the
   * result of another resource's `prepare`.
   * 
   * TopStories.prepare().then(() => {
   *   const storyIds = TopStories.get();
   *   storyIds.forEach(id => Story.prepare(id));
   * });
   */
  function get(...args: Parameters<F>) {
    const key = getKey(...args);
    return cache.get(key);
  }

  /**
   * ReactCash internals
   */

  function getKey(...args: Parameters<F>) {
    return typeof keyOrKeyGen === "string" ? keyOrKeyGen : keyOrKeyGen(...args);
  }

  function read(key: string, ...args: Parameters<F>) {
    const record = cache.get(key);
    if (!record || record instanceof Error) {
      const promise = resolveNetwork(key, ...args);
      cache.set(key, promise);
      throw promise;
    }
    if (record instanceof Promise) {
      throw record;
    }
    if (fetchPolicy === "cache_and_network") {
      resolveNetwork(key, ...args);
    }
    return record;
  }

  function resolveNetwork(key: string, ...args: Parameters<F>) {
    return fn(...args).then(
      (r) => {
        cache.set(key, r);
      },
      (e) => {
        cache.set(key, e);
      }
    );
  }

  function acquireLifetime(key: string) {
    const currentRefCount = refCount.get(key);
    if (!currentRefCount) {
      refCount.set(key, 1);
    } else {
      refCount.set(key, currentRefCount + 1);
    }
    if (gcReleaseBuffer.has(key)) {
      gcReleaseBuffer.delete(key);
    }
  }

  function enqueueCleanup(key: string) {
    const currentRefCount = refCount.get(key);
    if (currentRefCount === 0) {
      refCount.delete(key);
      gcReleaseBuffer.add(key);
      if (gcReleaseBuffer.size > maxBufferSize) {
        flushGc();
      }
    }
  }

  function flushGc() {
    gcReleaseBuffer.forEach((key) => {
      cache.delete(key);
      refCount.delete(key);
    });
  }

  return { prepare, useResource, get };
}
