import React, { useEffect } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  floatRange: number;
  driftX: number;
  duration: number;
  pulseDuration: number;
  delay: number;
  opacityMin: number;
  opacityMax: number;
  isGlow: boolean;
}

const PARTICLE_CONFIGS: ParticleConfig[] = [
  { id: 0,  x: 0.08, y: 0.12, size: 6,   floatRange: 22, driftX: 8,   duration: 9000,  pulseDuration: 5000, delay: 0,    opacityMin: 0.15, opacityMax: 0.45, isGlow: false },
  { id: 1,  x: 0.82, y: 0.07, size: 4,   floatRange: 18, driftX: -6,  duration: 11000, pulseDuration: 6000, delay: 800,  opacityMin: 0.10, opacityMax: 0.40, isGlow: false },
  { id: 2,  x: 0.45, y: 0.22, size: 5,   floatRange: 30, driftX: 10,  duration: 13000, pulseDuration: 7000, delay: 1600, opacityMin: 0.12, opacityMax: 0.35, isGlow: false },
  { id: 3,  x: 0.20, y: 0.55, size: 3,   floatRange: 20, driftX: -8,  duration: 8000,  pulseDuration: 4500, delay: 400,  opacityMin: 0.20, opacityMax: 0.55, isGlow: false },
  { id: 4,  x: 0.70, y: 0.40, size: 7,   floatRange: 25, driftX: 6,   duration: 14000, pulseDuration: 8000, delay: 2000, opacityMin: 0.08, opacityMax: 0.30, isGlow: false },
  { id: 5,  x: 0.55, y: 0.72, size: 4,   floatRange: 16, driftX: -5,  duration: 10000, pulseDuration: 5500, delay: 1200, opacityMin: 0.15, opacityMax: 0.45, isGlow: false },
  { id: 6,  x: 0.90, y: 0.65, size: 5,   floatRange: 28, driftX: 9,   duration: 12000, pulseDuration: 6500, delay: 2400, opacityMin: 0.10, opacityMax: 0.38, isGlow: false },
  { id: 7,  x: 0.33, y: 0.88, size: 3,   floatRange: 14, driftX: -7,  duration: 9500,  pulseDuration: 5000, delay: 600,  opacityMin: 0.18, opacityMax: 0.50, isGlow: false },
  { id: 8,  x: 0.12, y: 0.78, size: 6,   floatRange: 24, driftX: 11,  duration: 15000, pulseDuration: 7500, delay: 1800, opacityMin: 0.08, opacityMax: 0.28, isGlow: false },
  { id: 9,  x: 0.62, y: 0.15, size: 4,   floatRange: 20, driftX: -4,  duration: 10500, pulseDuration: 6000, delay: 300,  opacityMin: 0.12, opacityMax: 0.42, isGlow: false },
  { id: 10, x: 0.78, y: 0.82, size: 5,   floatRange: 26, driftX: 7,   duration: 11500, pulseDuration: 5800, delay: 2200, opacityMin: 0.10, opacityMax: 0.35, isGlow: false },
  { id: 11, x: 0.38, y: 0.48, size: 3,   floatRange: 18, driftX: -9,  duration: 8500,  pulseDuration: 4800, delay: 1000, opacityMin: 0.16, opacityMax: 0.48, isGlow: false },
  { id: 12, x: 0.15, y: 0.35, size: 80,  floatRange: 30, driftX: 15,  duration: 16000, pulseDuration: 9000, delay: 0,    opacityMin: 0.04, opacityMax: 0.10, isGlow: true  },
  { id: 13, x: 0.60, y: 0.55, size: 100, floatRange: 40, driftX: -20, duration: 18000, pulseDuration: 10000, delay: 1500, opacityMin: 0.03, opacityMax: 0.08, isGlow: true  },
  { id: 14, x: 0.80, y: 0.20, size: 70,  floatRange: 25, driftX: 12,  duration: 14000, pulseDuration: 8000, delay: 3000, opacityMin: 0.04, opacityMax: 0.09, isGlow: true  },
];

const LIGHT_COLORS = ["#52B788", "#40916C", "#74C69D", "#2D6A4F", "#95D5B2"];
const DARK_COLORS  = ["#52B788", "#74C69D", "#95D5B2", "#40916C", "#B7E4C7"];

function Particle({
  config,
  color,
  screenW,
  screenH,
}: {
  config: ParticleConfig;
  color: string;
  screenW: number;
  screenH: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity    = useSharedValue(config.opacityMin);

  useEffect(() => {
    translateY.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(-config.floatRange, {
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
    translateX.value = withDelay(
      config.delay + 300,
      withRepeat(
        withTiming(config.driftX, {
          duration: config.duration * 1.4,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(config.opacityMax, {
          duration: config.pulseDuration,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  const left = config.x * screenW - config.size / 2;
  const top  = config.y * screenH - config.size / 2;

  return (
    <Animated.View
      style={[
        {
          position: "absolute" as const,
          left,
          top,
          width:  config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: color,
        },
        config.isGlow && {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: config.size * 0.5,
          shadowOpacity: 0.6,
        },
        animStyle,
      ]}
      pointerEvents="none"
    />
  );
}

interface Props {
  width:  number;
  height: number;
}

export default function ParticleBackground({ width, height }: Props) {
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  if (width === 0 || height === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PARTICLE_CONFIGS.map((cfg) => (
        <Particle
          key={cfg.id}
          config={cfg}
          color={palette[cfg.id % palette.length]}
          screenW={width}
          screenH={height}
        />
      ))}
    </View>
  );
}
