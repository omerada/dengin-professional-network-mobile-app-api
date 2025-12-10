// src/features/feed/components/FilterBar/FilterBar.types.ts

import type { FeedFilter } from '../../types';

export interface FilterOption {
  key: FeedFilter;
  label: string;
  icon: string;
}

export interface FilterBarProps {
  testID?: string;
}
