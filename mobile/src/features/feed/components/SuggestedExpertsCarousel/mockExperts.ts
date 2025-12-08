// src/features/feed/components/SuggestedExpertsCarousel/mockExperts.ts
// Mock suggested experts data
// TODO: Replace with real API call when backend ready
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 410-550

import type { SuggestedExpert } from './SuggestedExpertsCarousel.types';

/**
 * Mock suggested experts for carousel
 * Backend API: GET /api/users/suggested
 */
export const MOCK_SUGGESTED_EXPERTS: SuggestedExpert[] = [
  {
    id: 101,
    fullName: 'Dr. Ayşe Yılmaz',
    profession: 'Kardiyolog',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
    followerCount: 1245,
  },
  {
    id: 102, 
    fullName: 'Av. Mehmet Demir',
    profession: 'İş Hukuku Avukatı',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
    followerCount: 892,
  },
  {
    id: 103,
    fullName: 'Mimar Can Öztürk',
    profession: 'Mimarlık',
    avatarUrl: null,
    isVerified: false,
    isFollowing: false,
    followerCount: 567,
  },
  {
    id: 104,
    fullName: 'Prof. Dr. Zeynep Kaya',
    profession: 'Psikiyatrist',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
    followerCount: 2134,
  },
  {
    id: 105,
    fullName: 'Müh. Ali Şahin',
    profession: 'Yazılım Mühendisi',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
    followerCount: 1678,
  },
  {
    id: 106,
    fullName: 'Doç. Dr. Fatma Arslan',
    profession: 'Dermatolog',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
    followerCount: 945,
  },
  {
    id: 107,
    fullName: 'Av. Hakan Çelik',
    profession: 'Ceza Avukatı',
    avatarUrl: null,
    isVerified: true,
    isFollowing: false,
    followerCount: 723,
  },
  {
    id: 108,
    fullName: 'Eczacı Selin Yurt',
    profession: 'Klinik Eczacı',
    avatarUrl: null,
    isVerified: false,
    isFollowing: false,
    followerCount: 456,
  },
];
