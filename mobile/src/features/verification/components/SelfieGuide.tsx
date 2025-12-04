// src/features/verification/components/SelfieGuide.tsx
// Selfie yakalama rehberi overlay bileşeni
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Svg, { Circle, Rect, Defs, Mask, G, Path } from 'react-native-svg';
import { useTheme } from '@contexts';
import { spacing, typography } from '@theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Selfie rehberi props
 */
interface SelfieGuideProps {
  /** İpucu metni */
  hint?: string;
  /** Yakalama durumu */
  isCapturing?: boolean;
  /** Yüz tespit edildi mi */
  faceDetected?: boolean;
}

/**
 * Selfie yakalama rehberi
 * Kamera önizlemesi üzerinde yüz yerleştirme alanını gösterir
 */
export const SelfieGuide: React.FC<SelfieGuideProps> = memo(
  ({ hint, isCapturing = false, faceDetected = false }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    // Yüz alanı boyutları (oval)
    const GUIDE_WIDTH = SCREEN_WIDTH * 0.65;
    const GUIDE_HEIGHT = GUIDE_WIDTH * 1.3; // Oval oran
    const CENTER_X = SCREEN_WIDTH / 2;
    const CENTER_Y = SCREEN_HEIGHT / 2 - 80;
    const RX = GUIDE_WIDTH / 2;
    const RY = GUIDE_HEIGHT / 2;

    const defaultHint = 'Yüzünüzü çerçeve içine yerleştirin';

    // Oval için SVG path
    const ovalPath = `
      M ${CENTER_X - RX} ${CENTER_Y}
      A ${RX} ${RY} 0 1 1 ${CENTER_X + RX} ${CENTER_Y}
      A ${RX} ${RY} 0 1 1 ${CENTER_X - RX} ${CENTER_Y}
      Z
    `;

    const getBorderColor = () => {
      if (isCapturing) return colors.success;
      if (faceDetected) return colors.primary;
      return colors.border;
    };

    return (
      <View style={styles.container} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            {/* Mask for darkening outside the guide */}
            <Mask id="selfie-mask">
              <Rect width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="white" />
              <Path d={ovalPath} fill="black" />
            </Mask>
          </Defs>

          {/* Dark overlay outside guide area */}
          <Rect
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="rgba(0,0,0,0.6)"
            mask="url(#selfie-mask)"
          />

          {/* Guide border (oval) */}
          <Path
            d={ovalPath}
            fill="none"
            stroke={getBorderColor()}
            strokeWidth={4}
            strokeDasharray={faceDetected || isCapturing ? '' : '10,5'}
          />

          {/* Face position markers */}
          <G stroke={colors.textInverse} strokeWidth={2} strokeLinecap="round" opacity={0.5}>
            {/* Eye level line */}
            <Path
              d={`M ${CENTER_X - 40} ${CENTER_Y - RY * 0.25} 
                  L ${CENTER_X + 40} ${CENTER_Y - RY * 0.25}`}
              strokeDasharray="5,5"
            />

            {/* Center cross */}
            <Circle cx={CENTER_X} cy={CENTER_Y} r={4} fill={colors.textInverse} />
          </G>
        </Svg>

        {/* Hint text */}
        <View style={[styles.hintContainer, { top: CENTER_Y + RY + 40 }]}>
          <Text
            style={[styles.hintText, { color: colors.textInverse }]}
            accessibilityRole="text"
            accessibilityLabel={hint || defaultHint}>
            {hint || defaultHint}
          </Text>
        </View>

        {/* Face detection status */}
        <View style={[styles.statusContainer, { top: CENTER_Y - RY - 60 }]}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: faceDetected ? colors.success : colors.warning,
              },
            ]}
          />
          <Text style={[styles.statusText, { color: colors.textInverse }]}>
            {faceDetected ? 'Yüz algılandı' : 'Yüzünüzü çerçeveye yerleştirin'}
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionText, { color: colors.textInverse }]}>
            💡 İyi aydınlatılmış bir ortamda olun
          </Text>
          <Text style={[styles.instructionText, { color: colors.textInverse }]}>
            👓 Gözlük varsa parlamaya dikkat edin
          </Text>
          <Text style={[styles.instructionText, { color: colors.textInverse }]}>
            😊 Doğal ifadenizi koruyun
          </Text>
        </View>
      </View>
    );
  },
);

SelfieGuide.displayName = 'SelfieGuide';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  hintContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  hintText: {
    ...typography.body,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  instructionText: {
    ...typography.caption,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default SelfieGuide;
