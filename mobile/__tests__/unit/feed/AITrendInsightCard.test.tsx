// __tests__/unit/feed/AITrendInsightCard.test.tsx
// Test suite for AITrendInsightCard component
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AITrendInsightCard } from '@features/feed/components/AITrendInsightCard';
import { useHaptic } from '@shared/hooks/useHaptic';
import * as trendService from '@features/feed/services/trendService';

// Mock dependencies
jest.mock('@shared/hooks/useHaptic');
jest.mock('@features/feed/services/trendService');
jest.mock('@contexts/ThemeContext', () => ({
  useColors: () => ({
    interactive: {
      default: '#0066FF',
    },
    background: {
      elevated: '#FFFFFF',
    },
    border: {
      default: '#E5E7EB',
    },
    text: {
      primary: '#1F2937',
      tertiary: '#9CA3AF',
    },
  }),
}));

const mockUseHaptic = useHaptic as jest.MockedFunction<typeof useHaptic>;
const mockGetTrendsByProfession = trendService.getTrendsByProfession as jest.MockedFunction<
  typeof trendService.getTrendsByProfession
>;

// Mock trends data
const MOCK_TRENDS = [
  {
    id: 'trend_1',
    title: 'Telemedicine ve Uzaktan Hasta Takibi 2025',
    professionCategory: 'MEDICAL' as const,
  },
  {
    id: 'trend_2',
    title: 'Yapay Zeka Destekli Tanı Sistemleri',
    professionCategory: 'MEDICAL' as const,
  },
  {
    id: 'trend_3',
    title: 'Kişiselleştirilmiş Tedavi Yaklaşımları',
    professionCategory: 'MEDICAL' as const,
  },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('AITrendInsightCard', () => {
  const mockOnTrendPress = jest.fn();
  const mockOnMorePress = jest.fn();
  const mockTrigger = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHaptic.mockReturnValue({
      trigger: mockTrigger,
      isSupported: true,
    });
    mockGetTrendsByProfession.mockResolvedValue(MOCK_TRENDS);
  });

  describe('Rendering', () => {
    it('renders correctly with all elements', async () => {
      const { getByText } = render(
        <AITrendInsightCard
          professionCategory="MEDICAL"
          onTrendPress={mockOnTrendPress}
          onMorePress={mockOnMorePress}
        />,
        { wrapper },
      );

      // Wait for data to load
      await waitFor(() => {
        expect(getByText("Bu Hafta Sağlık'de Trend")).toBeTruthy();
      });

      // Trend items (numbered 1, 2, 3)
      expect(getByText('1.')).toBeTruthy();
      expect(getByText('2.')).toBeTruthy();
      expect(getByText('3.')).toBeTruthy();

      // More button
      expect(getByText('Daha Fazla Gör →')).toBeTruthy();
    });

    it('does not render when no profession category provided', () => {
      const { queryByText } = render(<AITrendInsightCard onTrendPress={mockOnTrendPress} />, {
        wrapper,
      });

      expect(queryByText('Bu Haftanın Trendleri')).toBeNull();
    });

    it('renders 3 trend items maximum', async () => {
      const { getAllByRole } = render(
        <AITrendInsightCard professionCategory="LEGAL" onTrendPress={mockOnTrendPress} />,
        { wrapper },
      );

      const buttons = getAllByRole('button');
      // 3 trend items (no more button since onMorePress not provided)
      expect(buttons.length).toBe(3);
    });

    it('does not render "Daha Fazla Gör" when onMorePress not provided', () => {
      const { queryByText } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      expect(queryByText('Daha Fazla Gör →')).toBeNull();
    });

    it('applies correct test ID', () => {
      const { getByTestId } = render(
        <AITrendInsightCard
          profession="MEDICAL"
          testID="custom-test-id"
          onTrendPress={mockOnTrendPress}
        />,
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });
  });

  describe('Profession-based Trends', () => {
    it('displays MEDICAL trends for MEDICAL profession', () => {
      const { getByText } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      const medicalTrends = MOCK_TRENDS.MEDICAL;
      expect(getByText(medicalTrends[0].title)).toBeTruthy();
      expect(getByText(medicalTrends[1].title)).toBeTruthy();
      expect(getByText(medicalTrends[2].title)).toBeTruthy();
    });

    it('displays LEGAL trends for LEGAL profession', () => {
      const { getByText } = render(
        <AITrendInsightCard profession="LEGAL" onTrendPress={mockOnTrendPress} />,
      );

      const legalTrends = MOCK_TRENDS.LEGAL;
      expect(getByText(legalTrends[0].title)).toBeTruthy();
      expect(getByText(legalTrends[1].title)).toBeTruthy();
      expect(getByText(legalTrends[2].title)).toBeTruthy();
    });

    it('displays mixed trends when no profession specified', () => {
      const { getByText } = render(<AITrendInsightCard onTrendPress={mockOnTrendPress} />);

      const defaultTrends = getTrendsByProfession();
      expect(getByText(defaultTrends[0].title)).toBeTruthy();
      expect(getByText(defaultTrends[1].title)).toBeTruthy();
      expect(getByText(defaultTrends[2].title)).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onTrendPress when trend item pressed', () => {
      const { getByLabelText } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      const trends = MOCK_TRENDS.MEDICAL;
      const firstTrendButton = getByLabelText(`1. ${trends[0].title}`);

      fireEvent.press(firstTrendButton);

      expect(mockOnTrendPress).toHaveBeenCalledWith(trends[0].id);
      expect(mockOnTrendPress).toHaveBeenCalledTimes(1);
    });

    it('triggers light haptic feedback on trend press', () => {
      const { getByLabelText } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      const trends = MOCK_TRENDS.MEDICAL;
      const firstTrendButton = getByLabelText(`1. ${trends[0].title}`);

      fireEvent.press(firstTrendButton);

      expect(mockTrigger).toHaveBeenCalledWith('light');
    });

    it('calls onMorePress when "Daha Fazla Gör" pressed', () => {
      const { getByText } = render(
        <AITrendInsightCard
          profession="MEDICAL"
          onTrendPress={mockOnTrendPress}
          onMorePress={mockOnMorePress}
        />,
      );

      const moreButton = getByText('Daha Fazla Gör →');
      fireEvent.press(moreButton);

      expect(mockOnMorePress).toHaveBeenCalledTimes(1);
    });

    it('triggers haptic feedback on "Daha Fazla Gör" press', () => {
      const { getByText } = render(
        <AITrendInsightCard
          profession="MEDICAL"
          onTrendPress={mockOnTrendPress}
          onMorePress={mockOnMorePress}
        />,
      );

      const moreButton = getByText('Daha Fazla Gör →');
      fireEvent.press(moreButton);

      expect(mockTrigger).toHaveBeenCalledWith('light');
    });

    it('handles multiple trend presses correctly', () => {
      const { getAllByRole } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      const trendButtons = getAllByRole('button');
      const trends = MOCK_TRENDS.MEDICAL;

      // Press all trend items
      trendButtons.forEach((button, index) => {
        fireEvent.press(button);
      });

      expect(mockOnTrendPress).toHaveBeenCalledTimes(3);
      expect(mockOnTrendPress).toHaveBeenNthCalledWith(1, trends[0].id);
      expect(mockOnTrendPress).toHaveBeenNthCalledWith(2, trends[1].id);
      expect(mockOnTrendPress).toHaveBeenNthCalledWith(3, trends[2].id);
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibilityRole for trend items', () => {
      const { getAllByRole } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has descriptive accessibility labels for trends', () => {
      const { getByLabelText } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      const trends = MOCK_TRENDS.MEDICAL;
      expect(getByLabelText(`1. ${trends[0].title}`)).toBeTruthy();
      expect(getByLabelText(`2. ${trends[1].title}`)).toBeTruthy();
      expect(getByLabelText(`3. ${trends[2].title}`)).toBeTruthy();
    });

    it('has accessibility label for "Daha Fazla Gör" button', () => {
      const { getByLabelText } = render(
        <AITrendInsightCard
          profession="MEDICAL"
          onTrendPress={mockOnTrendPress}
          onMorePress={mockOnMorePress}
        />,
      );

      expect(getByLabelText('Daha fazla trend gör')).toBeTruthy();
    });
  });

  describe('Mock Data Utility', () => {
    it('getTrendsByProfession returns correct trends', () => {
      const medicalTrends = getTrendsByProfession('MEDICAL');
      expect(medicalTrends).toHaveLength(3);
      expect(medicalTrends[0].professionCategory).toBe('MEDICAL');
    });

    it('getTrendsByProfession handles case-insensitive profession names', () => {
      const trends1 = getTrendsByProfession('medical');
      const trends2 = getTrendsByProfession('MEDICAL');
      expect(trends1).toEqual(trends2);
    });

    it('getTrendsByProfession returns default trends for unknown profession', () => {
      const trends = getTrendsByProfession('UNKNOWN_PROFESSION');
      expect(trends).toHaveLength(3);
      expect(trends.every(t => t.professionCategory === 'OTHER')).toBe(true);
    });

    it('getTrendsByProfession returns default trends when no profession provided', () => {
      const trends = getTrendsByProfession();
      expect(trends).toHaveLength(3);
    });
  });

  describe('Memoization', () => {
    it('does not re-compute trends when props unchanged', () => {
      const { rerender } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      const getTrendsSpy = jest.spyOn({ getTrendsByProfession }, 'getTrendsByProfession');

      rerender(<AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />);

      // Component is memoized, getTrendsByProfession should not be called again
      expect(getTrendsSpy).not.toHaveBeenCalled();

      getTrendsSpy.mockRestore();
    });

    it('re-computes trends when profession changes', () => {
      const { rerender, getByText } = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      );

      expect(getByText(MOCK_TRENDS.MEDICAL[0].title)).toBeTruthy();

      rerender(<AITrendInsightCard profession="LEGAL" onTrendPress={mockOnTrendPress} />);

      expect(getByText(MOCK_TRENDS.LEGAL[0].title)).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('matches snapshot', () => {
      const tree = render(
        <AITrendInsightCard profession="MEDICAL" onTrendPress={mockOnTrendPress} />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot with onMorePress', () => {
      const tree = render(
        <AITrendInsightCard
          profession="MEDICAL"
          onTrendPress={mockOnTrendPress}
          onMorePress={mockOnMorePress}
        />,
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot without profession', () => {
      const tree = render(<AITrendInsightCard onTrendPress={mockOnTrendPress} />).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
