// src/features/feed/components/AITrendInsightCard/mockTrends.ts
// Mock profession-based trend data
// Future: Replace with backend AI service (GET /api/trends/profession/:id)

/**
 * Trend item interface
 */
export interface TrendItem {
  id: string;
  title: string;
  professionCategory: string;
}

/**
 * Mock profession trend data
 * Backend AI service will provide real-time trending topics per profession
 */
export const MOCK_TRENDS: Record<string, TrendItem[]> = {
  MEDICAL: [
    { id: '1', title: 'Telemedicine 2025 Trends', professionCategory: 'MEDICAL' },
    { id: '2', title: 'AI Diagnosis Systems', professionCategory: 'MEDICAL' },
    { id: '3', title: 'Patient Data Privacy Laws', professionCategory: 'MEDICAL' },
  ],
  LEGAL: [
    { id: '4', title: 'New Labor Law Changes', professionCategory: 'LEGAL' },
    { id: '5', title: 'Digital Evidence Guidelines', professionCategory: 'LEGAL' },
    { id: '6', title: 'Remote Court Sessions', professionCategory: 'LEGAL' },
  ],
  ENGINEERING: [
    { id: '7', title: 'Sustainable Construction', professionCategory: 'ENGINEERING' },
    { id: '8', title: 'AI in Civil Engineering', professionCategory: 'ENGINEERING' },
    { id: '9', title: 'Green Building Standards', professionCategory: 'ENGINEERING' },
  ],
  EDUCATION: [
    { id: '10', title: 'Hybrid Teaching Methods', professionCategory: 'EDUCATION' },
    { id: '11', title: 'EdTech Innovation 2025', professionCategory: 'EDUCATION' },
    { id: '12', title: 'Student Mental Health', professionCategory: 'EDUCATION' },
  ],
  SERVICE: [
    { id: '13', title: 'Customer Experience AI', professionCategory: 'SERVICE' },
    { id: '14', title: 'Service Automation Trends', professionCategory: 'SERVICE' },
    { id: '15', title: 'Employee Wellbeing Programs', professionCategory: 'SERVICE' },
  ], 
  CREATIVE: [
    { id: '16', title: 'AI Art Generation Debate', professionCategory: 'CREATIVE' },
    { id: '17', title: 'NFT Market Evolution', professionCategory: 'CREATIVE' },
    { id: '18', title: 'UX Design Best Practices', professionCategory: 'CREATIVE' },
  ],
  BUSINESS: [
    { id: '19', title: 'Remote Work Culture', professionCategory: 'BUSINESS' },
    { id: '20', title: 'Startup Funding Landscape', professionCategory: 'BUSINESS' },
    { id: '21', title: 'Data-Driven Decision Making', professionCategory: 'BUSINESS' },
  ],
  OTHER: [
    { id: '22', title: 'Career Transition Tips', professionCategory: 'OTHER' },
    { id: '23', title: 'Networking Best Practices', professionCategory: 'OTHER' },
    { id: '24', title: 'Professional Development', professionCategory: 'OTHER' },
  ],
};

/**
 * Get trends for a specific profession
 * @param professionName - Profession name or category
 * @returns Array of 3 trend items
 */
export const getTrendsByProfession = (professionName?: string): TrendItem[] => {
  if (!professionName) {
    // Default trends (mixed)
    return [MOCK_TRENDS.BUSINESS[0], MOCK_TRENDS.CREATIVE[0], MOCK_TRENDS.EDUCATION[0]];
  }

  // Try to find matching category
  const category = Object.keys(MOCK_TRENDS).find(
    key => key.toLowerCase() === professionName.toLowerCase(),
  );

  if (category && MOCK_TRENDS[category]) {
    return MOCK_TRENDS[category].slice(0, 3);
  }

  // Fallback to OTHER category
  return MOCK_TRENDS.OTHER.slice(0, 3);
};
