import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

type Props = {
  tier: string;
  width?: number;
  height?: number;
};

export function CustomMedalIcon({ tier, width = 80, height = 98 }: Props) {
  const t = (tier || "").toUpperCase();

  // 1. Keep Diamond Gem icon for personal/company use
  if (t === "DIAMOND_GEM") {
    return (
      <Svg
        viewBox="0 0 200 245"
        width={width}
        height={height}
        style={{ alignSelf: "center" }}
      >
        <Defs>
          <LinearGradient id="diam-g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#e0f2fe" />
            <Stop offset="100%" stopColor="#38bdf8" />
          </LinearGradient>
          <LinearGradient id="diam-g2" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" />
            <Stop offset="100%" stopColor="#bae6fd" />
          </LinearGradient>
          <LinearGradient id="diam-g3" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#bae6fd" />
            <Stop offset="100%" stopColor="#0284c7" />
          </LinearGradient>
          <LinearGradient id="diam-g4" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7dd3fc" />
            <Stop offset="100%" stopColor="#0369a1" />
          </LinearGradient>
          <LinearGradient id="diam-g5" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" />
            <Stop offset="100%" stopColor="#38bdf8" />
          </LinearGradient>
          <LinearGradient id="diam-g6" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#38bdf8" />
            <Stop offset="100%" stopColor="#075985" />
          </LinearGradient>
        </Defs>

        <Circle cx="100" cy="135" r="70" fill="#38bdf8" opacity={0.15} />

        <G>
          <Path
            d="M 60,60 L 20,110 L 75,110 Z"
            fill="url(#diam-g1)"
            stroke="#ffffff"
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Path
            d="M 60,60 L 75,110 L 125,110 L 140,60 Z"
            fill="url(#diam-g2)"
            stroke="#ffffff"
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Path
            d="M 140,60 L 125,110 L 180,110 Z"
            fill="url(#diam-g3)"
            stroke="#ffffff"
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Path
            d="M 20,110 L 100,210 L 75,110 Z"
            fill="url(#diam-g4)"
            stroke="#ffffff"
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Path
            d="M 75,110 L 100,210 L 125,110 Z"
            fill="url(#diam-g5)"
            stroke="#ffffff"
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Path
            d="M 125,110 L 100,210 L 180,110 Z"
            fill="url(#diam-g6)"
            stroke="#ffffff"
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </G>

        {/* Sparkles */}
        <G transform="translate(50, 55) scale(0.8)">
          <Path
            d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 0,-8 Z"
            fill="#ffffff"
          />
        </G>
        <G transform="translate(165, 105) scale(1.2)">
          <Path
            d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 0,-8 Z"
            fill="#ffffff"
          />
        </G>
        <G transform="translate(100, 180) scale(0.6)">
          <Path
            d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 0,-8 Z"
            fill="#ffffff"
          />
        </G>
      </Svg>
    );
  }

  // Standard normalized categories: render modern premium geometric shape
  let startColor = "#3b82f6";
  let endColor = "#1d4ed8";
  let customSvgContent = null;

  if (t === "BRONZE") {
    // Spark - Amber/Orange Sparkle Star
    startColor = "#f59e0b";
    endColor = "#b45309";
    customSvgContent = (
      <Path
        d="M 100 65 Q 100 120 155 120 Q 100 120 100 175 Q 100 120 45 120 Q 100 120 100 65 Z"
        fill="#ffffff"
      />
    );
  } else if (t === "SILVER") {
    // Pulse - Teal ECG Line
    startColor = "#0d9488";
    endColor = "#115e59";
    customSvgContent = (
      <Path
        d="M 50 120 L 75 120 L 85 90 L 97 150 L 109 105 L 119 135 L 127 120 L 150 120"
        stroke="#ffffff"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  } else if (t === "GOLD") {
    // Momentum - Blue Chevrons
    startColor = "#2563eb";
    endColor = "#1e3a8a";
    customSvgContent = (
      <G
        stroke="#ffffff"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Path d="M 65 105 L 100 75 L 135 105" />
        <Path d="M 65 125 L 100 95 L 135 125" />
        <Path d="M 65 145 L 100 115 L 135 145" />
      </G>
    );
  } else if (t === "DIAMOND") {
    // Catalyst - Emerald Atom/Network
    startColor = "#10b981";
    endColor = "#064e3b";
    customSvgContent = (
      <G fill="none">
        <Path d="M 100 120 L 135 85" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
        <Path d="M 100 120 L 65 85" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
        <Path d="M 100 120 L 135 155" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
        <Path d="M 100 120 L 65 155" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
        <Circle cx={100} cy={120} r={10} fill="#ffffff" />
        <Circle cx={135} cy={85} r={7} fill="#ffffff" />
        <Circle cx={65} cy={85} r={7} fill="#ffffff" />
        <Circle cx={135} cy={155} r={7} fill="#ffffff" />
        <Circle cx={65} cy={155} r={7} fill="#ffffff" />
      </G>
    );
  } else if (t === "PLATINUM") {
    // Apex - Purple Overlapping Peaks
    startColor = "#a855f7";
    endColor = "#581c87";
    customSvgContent = (
      <G fill="#ffffff" stroke="#ffffff" strokeWidth={2} strokeLinejoin="round">
        <Polygon points="100,80 60,150 140,150" opacity={0.6} />
        <Polygon points="120,95 85,150 155,150" />
      </G>
    );
  } else if (t === "VANGUARD") {
    // Vanguard - Rose Shield with Star
    startColor = "#f43f5e";
    endColor = "#881337";
    customSvgContent = (
      <G fill="#ffffff">
        <Path
          d="M 70 80 L 130 80 L 130 120 C 130 150 100 165 100 165 C 100 165 70 150 70 120 Z"
          opacity={0.9}
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Polygon
          points="100,98 103,107 112,107 105,113 107,122 100,116 93,122 95,113 88,107 97,107"
          fill={endColor}
        />
      </G>
    );
  } else {
    customSvgContent = (
      <Circle cx={100} cy={120} r={30} fill="#ffffff" />
    );
  }

  return (
    <Svg
      viewBox="0 0 200 245"
      width={width}
      height={height}
      style={{ alignSelf: "center" }}
    >
      <Defs>
        <LinearGradient id={`bg-grad-${t}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={startColor} />
          <Stop offset="100%" stopColor={endColor} />
        </LinearGradient>
      </Defs>

      {/* Ambient Glow */}
      <Rect
        x={30}
        y={52}
        width={140}
        height={140}
        rx={35}
        fill={startColor}
        opacity={0.15}
      />

      {/* Squircle Card Container */}
      <Rect
        x={30}
        y={52}
        width={140}
        height={140}
        rx={35}
        fill={`url(#bg-grad-${t})`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={2}
      />

      {customSvgContent}
    </Svg>
  );
}
