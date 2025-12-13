// src/shared/components/LoadingState/LoadingState.types.ts
// LoadingState Type Definitions

/**
 * LoadingState Props
 */
export interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Show spinner */
  showSpinner?: boolean;
  /** Spinner size */
  size?: 'small' | 'large';
  /** Spinner color */
  color?: string;
  /** Test ID */
  testID?: string;
}
