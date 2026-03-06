// src/features/verification/components/DocumentGuide.tsx
// Belge yakalama rehberi overlay bileşeni
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Svg, { Rect, Defs, Mask, G, Line } from 'react-native-svg';
import { useColors } from '@contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Belge rehberi props
 */
interface DocumentGuideProps {
  /** Belge türü */
  type: 'front' | 'back';
  /** İpucu metni */
  hint?: string;
  /** Yakalama durumu */
  isCapturing?: boolean;
}

/**
 * Belge yakalama rehberi
 * Kamera önizlemesi üzerinde belge yerleştirme alanını gösterir
 */
export const DocumentGuide: React.FC<DocumentGuideProps> = memo(
  ({ type, hint, isCapturing = false }) => {
    const colors = useColors();

    // Belge alanı boyutları (ID kart oranı: 85.6mm x 54mm)
    const GUIDE_WIDTH = SCREEN_WIDTH * 0.85;
    const GUIDE_HEIGHT = GUIDE_WIDTH * 0.63; // ID kart oranı
    const GUIDE_X = (SCREEN_WIDTH - GUIDE_WIDTH) / 2;
    const GUIDE_Y = (SCREEN_HEIGHT - GUIDE_HEIGHT) / 2 - 50;
    const CORNER_SIZE = 24;
    const BORDER_RADIUS = borderRadius.lg;

    const defaultHint =
      type === 'front'
        ? 'Belgenizin ön yüzünü çerçeve içine yerleştirin'
        : 'Belgenizin arka yüzünü çerçeve içine yerleştirin';

    return (
      <View style={styles.container} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            {/* Mask for darkening outside the guide */}
            <Mask id="guide-mask">
              <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="white" />
              <Rect
                x={GUIDE_X}
                y={GUIDE_Y}
                width={GUIDE_WIDTH}
                height={GUIDE_HEIGHT}
                rx={BORDER_RADIUS}
                fill="black"
              />
            </Mask>
          </Defs>

          {/* Dark overlay outside guide area */}
          <Rect
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill={colors.background.overlay}
            mask="url(#guide-mask)"
          />

          {/* Guide border */}
          <Rect
            x={GUIDE_X}
            y={GUIDE_Y}
            width={GUIDE_WIDTH}
            height={GUIDE_HEIGHT}
            rx={BORDER_RADIUS}
            fill="none"
            stroke={isCapturing ? colors.status.success : colors.interactive.default}
            strokeWidth={3}
            strokeDasharray={isCapturing ? '' : '10,5'}
          />

          {/* Corner markers */}
          <G stroke={colors.interactive.default} strokeWidth={4} strokeLinecap="round">
            {/* Top-left corner */}
            <Line x1={GUIDE_X} y1={GUIDE_Y + CORNER_SIZE} x2={GUIDE_X} y2={GUIDE_Y} />
            <Line x1={GUIDE_X} y1={GUIDE_Y} x2={GUIDE_X + CORNER_SIZE} y2={GUIDE_Y} />

            {/* Top-right corner */}
            <Line
              x1={GUIDE_X + GUIDE_WIDTH - CORNER_SIZE}
              y1={GUIDE_Y}
              x2={GUIDE_X + GUIDE_WIDTH}
              y2={GUIDE_Y}
            />
            <Line
              x1={GUIDE_X + GUIDE_WIDTH}
              y1={GUIDE_Y}
              x2={GUIDE_X + GUIDE_WIDTH}
              y2={GUIDE_Y + CORNER_SIZE}
            />

            {/* Bottom-right corner */}
            <Line
              x1={GUIDE_X + GUIDE_WIDTH}
              y1={GUIDE_Y + GUIDE_HEIGHT - CORNER_SIZE}
              x2={GUIDE_X + GUIDE_WIDTH}
              y2={GUIDE_Y + GUIDE_HEIGHT}
            />
            <Line
              x1={GUIDE_X + GUIDE_WIDTH}
              y1={GUIDE_Y + GUIDE_HEIGHT}
              x2={GUIDE_X + GUIDE_WIDTH - CORNER_SIZE}
              y2={GUIDE_Y + GUIDE_HEIGHT}
            />

            {/* Bottom-left corner */}
            <Line
              x1={GUIDE_X + CORNER_SIZE}
              y1={GUIDE_Y + GUIDE_HEIGHT}
              x2={GUIDE_X}
              y2={GUIDE_Y + GUIDE_HEIGHT}
            />
            <Line
              x1={GUIDE_X}
              y1={GUIDE_Y + GUIDE_HEIGHT}
              x2={GUIDE_X}
              y2={GUIDE_Y + GUIDE_HEIGHT - CORNER_SIZE}
            />
          </G>
        </Svg>

        {/* Hint text */}
        <View style={[styles.hintContainer, { top: GUIDE_Y + GUIDE_HEIGHT + 30 }]}>
          <Text
            style={[styles.hintText, { color: colors.text.inverse }]}
            accessibilityRole="text"
            accessibilityLabel={hint || defaultHint}>
            {hint || defaultHint}
          </Text>
        </View>

        {/* Document type indicator */}
        <View style={[styles.typeIndicator, { top: GUIDE_Y - 50 }]}>
          <Text style={[styles.typeText, { color: colors.text.inverse }]}>
            {type === 'front' ? 'ÖN YÜZ' : 'ARKA YÜZ'}
          </Text>
        </View>
      </View>
    );
  },
);

DocumentGuide.displayName = 'DocumentGuide';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  hintContainer: {
    alignItems: 'center',
    left: 0,
    paddingHorizontal: spacing.lg,
    position: 'absolute',
    right: 0,
  },
  hintText: {
    ...typography.body,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  typeIndicator: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  typeText: {
    ...typography.h3,
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default DocumentGuide;
