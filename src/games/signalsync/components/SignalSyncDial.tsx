import React, { type JSX, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { colors, fonts, spacing } from '../../../theme/theme';
import { BAND_EDGES } from '../scoring';

interface SignalSyncDialProps {
  /** 0-100 target centre. Bands only render when this is non-null AND revealBands is true. */
  target: number | null;
  /** 0-100 current needle position. */
  guess: number;
  /** When true the needle can be dragged. */
  interactive: boolean;
  /** Called continuously while dragging with the new 0-100 value. */
  onGuessChange?: (value: number) => void;
  /** When true, the coloured scoring bands are drawn. When false the arc is plain. */
  revealBands: boolean;
  /** Left spectrum endpoint label, e.g. "Terrible vacation". */
  leftLabel: string;
  /** Right spectrum endpoint label. */
  rightLabel: string;
}

const MAX_DIAL_WIDTH = 360;
const ARC_STROKE_WIDTH = 28;
const NEEDLE_STROKE_WIDTH = 4;
const KNOB_RADIUS = 7;
const POINT_FONT_SIZE = 11;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function pointOnArc(value: number, centreX: number, centreY: number, radius: number) {
  const angle = Math.PI - (clamp(value, 0, 100) / 100) * Math.PI;
  return {
    x: centreX + radius * Math.cos(angle),
    y: centreY - radius * Math.sin(angle),
  };
}

function arcPath(
  startValue: number,
  endValue: number,
  centreX: number,
  centreY: number,
  radius: number,
): string {
  const start = pointOnArc(startValue, centreX, centreY, radius);
  const end = pointOnArc(endValue, centreX, centreY, radius);
  const largeArc = endValue - startValue > 50 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function scoringBand(value: number, target: number): number {
  const distance = Math.abs(value - target);
  const edge = BAND_EDGES.findIndex((bandEdge) => distance <= bandEdge);
  return edge === -1 ? 0 : BAND_EDGES.length - edge;
}

export function SignalSyncDial({
  target,
  guess,
  interactive,
  onGuessChange,
  revealBands,
  leftLabel,
  rightLabel,
}: SignalSyncDialProps): JSX.Element {
  const { width: windowWidth } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const dialWidth = Math.min(windowWidth - spacing.xl * 2, MAX_DIAL_WIDTH);
  const centreX = dialWidth / 2;
  const radius = centreX - spacing.lg;
  const centreY = radius + spacing.lg;
  const svgHeight = centreY + spacing.lg;
  const needleEnd = pointOnArc(guess, centreX, centreY, radius);
  const revealScale = useRef(new Animated.Value(1)).current;
  const revealOpacity = useRef(new Animated.Value(1)).current;
  const previousReveal = useRef(revealBands);
  const lastBand = useRef<number | null>(null);

  useEffect(() => {
    const didReveal = revealBands && !previousReveal.current;
    previousReveal.current = revealBands;

    if (!didReveal) return;
    if (reducedMotion) {
      revealScale.setValue(1);
      revealOpacity.setValue(1);
      return;
    }

    revealScale.setValue(0.8);
    revealOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(revealScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(revealOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reducedMotion, revealBands, revealOpacity, revealScale]);

  useEffect(() => {
    if (!revealBands || target === null) lastBand.current = null;
  }, [revealBands, target]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => interactive,
        onMoveShouldSetPanResponder: () => interactive,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          updateGuess(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          updateGuess(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
      }),
    [centreX, centreY, interactive, onGuessChange, revealBands, target],
  );

  function updateGuess(x: number, y: number) {
    const dx = x - centreX;
    const dy = centreY - y;
    if (dx === 0 && dy === 0) return;

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle = dx < 0 ? Math.PI : 0;
    const value = clamp(100 - (angle / Math.PI) * 100, 0, 100);

    if (revealBands && target !== null) {
      const nextBand = scoringBand(value, clamp(target, 0, 100));
      if (lastBand.current !== null && nextBand !== lastBand.current) Vibration.vibrate(10);
      lastBand.current = nextBand;
    }

    onGuessChange?.(value);
  }

  const bandDefinitions = [
    { edge: BAND_EDGES[3], points: 1, color: colors.purple },
    { edge: BAND_EDGES[2], points: 2, color: colors.primary },
    { edge: BAND_EDGES[1], points: 3, color: colors.orange },
    { edge: BAND_EDGES[0], points: 4, color: colors.yellow },
  ] as const;

  return (
    <View style={[styles.container, { width: dialWidth }]} {...panResponder.panHandlers}>
      <View style={{ height: svgHeight }}>
        <Svg width={dialWidth} height={svgHeight}>
          <Path
            d={arcPath(0, 100, centreX, centreY, radius)}
            fill="none"
            stroke={colors.border}
            strokeWidth={ARC_STROKE_WIDTH}
            strokeLinecap="butt"
          />
        </Svg>

        {revealBands && target !== null ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.svgOverlay,
              {
                opacity: revealOpacity,
                transform: [{ scale: revealScale }],
              },
            ]}
          >
            <Svg width={dialWidth} height={svgHeight}>
              {bandDefinitions.map(({ edge, points, color }) => {
                const start = clamp(target - edge, 0, 100);
                const end = clamp(target + edge, 0, 100);
                return (
                  <Path
                    key={points}
                    d={arcPath(start, end, centreX, centreY, radius)}
                    fill="none"
                    stroke={color}
                    strokeWidth={ARC_STROKE_WIDTH}
                    strokeLinecap="butt"
                  />
                );
              })}
              {bandDefinitions.map(({ edge, points }) => {
                const innerEdge = points === 4 ? 0 : BAND_EDGES[4 - points - 1];
                const labelValue = clamp(target + (innerEdge + edge) / 2, 0, 100);
                const label = pointOnArc(labelValue, centreX, centreY, radius);
                return (
                  <SvgText
                    key={points}
                    x={label.x}
                    y={label.y + POINT_FONT_SIZE / 3}
                    fill={points === 4 ? colors.bg : colors.text}
                    fontFamily={fonts.bodyExtra}
                    fontSize={POINT_FONT_SIZE}
                    textAnchor="middle"
                  >
                    {points}
                  </SvgText>
                );
              })}
            </Svg>
          </Animated.View>
        ) : null}

        <View pointerEvents="none" style={styles.svgOverlay}>
          <Svg width={dialWidth} height={svgHeight}>
            <Line
              x1={centreX}
              y1={centreY}
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke={colors.text}
              strokeWidth={NEEDLE_STROKE_WIDTH}
              strokeLinecap="round"
            />
            <Circle cx={centreX} cy={centreY} r={KNOB_RADIUS} fill={colors.text} />
            <Circle cx={needleEnd.x} cy={needleEnd.y} r={KNOB_RADIUS} fill={colors.text} />
          </Svg>
        </View>
      </View>

      <View style={styles.labels}>
        <Text numberOfLines={2} style={[styles.label, styles.leftLabel]}>
          {leftLabel}
        </Text>
        <Text numberOfLines={2} style={[styles.label, styles.rightLabel]}>
          {rightLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  svgOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  label: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    lineHeight: 16,
  },
  leftLabel: {
    textAlign: 'left',
  },
  rightLabel: {
    textAlign: 'right',
  },
});
