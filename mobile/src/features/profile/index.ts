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
export { useProfileStore, selectViewedProfile, selectIsLoadingProfile } from './stores';

// Components - export individually to avoid conflicts
export {
  ProfileHeader,
  ParallaxProfileHeader,
  ProfileActions,
  ProfileBio,
  AvatarPicker,
  SettingsItem,
  SettingsSection,
  EditProfileForm,
} from './components';
export { ProfileStats } from './components/ProfileStats';

// Screens
export * from './screens';
