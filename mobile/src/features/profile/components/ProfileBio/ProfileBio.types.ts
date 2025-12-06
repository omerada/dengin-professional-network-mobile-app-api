// src/features/profile/components/ProfileBio/ProfileBio.types.ts
// Meslektaş Design System - ProfileBio Type Definitions
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

/**
 * ProfileBio component props
 */
export interface ProfileBioProps {
  /** Bio text to display */
  bio: string | null;
  /** Maximum number of lines before truncation */
  maxLines?: number;
  /** Test ID */
  testID?: string;
}

/**
 * Maximum bio length before showing "more" button
 */
export const MAX_BIO_LENGTH = 150;
