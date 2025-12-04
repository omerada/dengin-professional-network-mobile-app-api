// src/features/profile/index.ts
// Profile module exports

// Types
export * from './types';

// Services
export { profileApi } from './services';

// Hooks
export {
  profileKeys,
  useProfile,
  useMyProfile,
  useProfileStats,
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
  useChangePassword,
  useDeleteAccount,
  useChangeProfession,
} from './hooks';

// Store
export {
  useProfileStore,
  selectViewedProfile,
  selectIsLoadingProfile,
} from './stores';

// Components
export * from './components';

// Screens
export * from './screens';
