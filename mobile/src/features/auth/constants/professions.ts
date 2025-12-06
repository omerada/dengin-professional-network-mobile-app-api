// src/features/auth/constants/professions.ts
// Hardcoded profession list - Backend'den bağımsız

export interface Profession {
  id: number;
  name: string;
  category: string;
  requiresVerification: boolean;
}

export const PROFESSIONS: Profession[] = [
  // Healthcare
  { id: 1, name: 'Doktor', category: 'HEALTHCARE', requiresVerification: true },
  { id: 2, name: 'Hemşire', category: 'HEALTHCARE', requiresVerification: true },
  { id: 3, name: 'Eczacı', category: 'HEALTHCARE', requiresVerification: true },
  { id: 4, name: 'Veteriner', category: 'HEALTHCARE', requiresVerification: true },
  { id: 5, name: 'Diyetisyen', category: 'HEALTHCARE', requiresVerification: true },
  { id: 6, name: 'Fizyoterapist', category: 'HEALTHCARE', requiresVerification: true },

  // Engineering
  { id: 7, name: 'Yazılım Geliştirici', category: 'ENGINEERING', requiresVerification: false },
  { id: 8, name: 'Makine Mühendisi', category: 'ENGINEERING', requiresVerification: true },
  { id: 9, name: 'İnşaat Mühendisi', category: 'ENGINEERING', requiresVerification: true },
  { id: 10, name: 'Elektrik Mühendisi', category: 'ENGINEERING', requiresVerification: true },
  { id: 11, name: 'Endüstri Mühendisi', category: 'ENGINEERING', requiresVerification: true },
  { id: 12, name: 'Bilgisayar Mühendisi', category: 'ENGINEERING', requiresVerification: true },

  // Education
  { id: 13, name: 'Öğretmen', category: 'EDUCATION', requiresVerification: true },
  { id: 14, name: 'Akademisyen', category: 'EDUCATION', requiresVerification: true },
  { id: 15, name: 'Eğitim Koçu', category: 'EDUCATION', requiresVerification: false },

  // Legal
  { id: 16, name: 'Avukat', category: 'LEGAL', requiresVerification: true },
  { id: 17, name: 'Hakim', category: 'LEGAL', requiresVerification: true },
  { id: 18, name: 'Savcı', category: 'LEGAL', requiresVerification: true },
  { id: 19, name: 'Noter', category: 'LEGAL', requiresVerification: true },

  // Finance
  { id: 20, name: 'Muhasebeci', category: 'FINANCE', requiresVerification: true },
  { id: 21, name: 'Mali Müşavir', category: 'FINANCE', requiresVerification: true },
  { id: 22, name: 'Finans Analisti', category: 'FINANCE', requiresVerification: false },
  { id: 23, name: 'Bankacı', category: 'FINANCE', requiresVerification: false },

  // Creative
  { id: 24, name: 'Grafik Tasarımcı', category: 'CREATIVE', requiresVerification: false },
  { id: 25, name: 'Mimar', category: 'CREATIVE', requiresVerification: true },
  { id: 26, name: 'İç Mimar', category: 'CREATIVE', requiresVerification: true },
  { id: 27, name: 'Ürün Tasarımcısı', category: 'CREATIVE', requiresVerification: false },
  { id: 28, name: 'Fotoğrafçı', category: 'CREATIVE', requiresVerification: false },

  // Business
  { id: 29, name: 'İnsan Kaynakları Uzmanı', category: 'BUSINESS', requiresVerification: false },
  { id: 30, name: 'Pazarlama Uzmanı', category: 'BUSINESS', requiresVerification: false },
  { id: 31, name: 'Satış Danışmanı', category: 'BUSINESS', requiresVerification: false },
  { id: 32, name: 'İşletme Sahibi', category: 'BUSINESS', requiresVerification: false },
  { id: 33, name: 'Proje Yöneticisi', category: 'BUSINESS', requiresVerification: false },

  // Services
  { id: 34, name: 'Aşçı', category: 'SERVICES', requiresVerification: false },
  { id: 35, name: 'Güzellik Uzmanı', category: 'SERVICES', requiresVerification: false },
  { id: 36, name: 'Berber/Kuaför', category: 'SERVICES', requiresVerification: false },
  { id: 37, name: 'Antrenör', category: 'SERVICES', requiresVerification: false },

  // Other
  { id: 999, name: 'Diğer Meslek', category: 'OTHER', requiresVerification: false },
];
