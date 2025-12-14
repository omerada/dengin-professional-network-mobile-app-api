// src/hooks/index.ts
// Production-ready custom hooks

export { useDebounce } from './useDebounce';
export {
  useOptimisticUpdate,
  useOptimisticToggle,
  useOptimisticCounter,
} from './useOptimisticUpdate';
export type { OptimisticUpdateOptions, OptimisticUpdateState } from './useOptimisticUpdate';
