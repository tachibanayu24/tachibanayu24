/**
 * Background Animation System - Theme Management
 *
 * Handles color palette generation and CSS variable updates.
 */

import { CONFIG } from "../config.js";
import { TIME_PALETTES } from "./palette.js";
import {
  hexToRgb,
  hexToRgba,
  interpolateColor,
  interpolateRgbaColor,
  parseRgbaColor,
} from "./interpolation.js";

/**
 * Get the complete color palette for current time with optional transition blending
 * @param {string} timePeriod - Target time period
 * @param {number} transitionFactor - Transition progress (0 = previousTimePeriod, 1 = timePeriod)
 * @param {string} previousTimePeriod - Source time period for transitions
 * @returns {import('./palette.js').ColorPalette} Blended color palette
 */
export function getColorPalette(
  timePeriod,
  transitionFactor = 1,
  previousTimePeriod = null,
) {
  let palette = { ...TIME_PALETTES[timePeriod], timePeriod };

  // Apply time transition if needed
  // transitionFactor: 0 = fully 'previous', 1 = fully 'current'
  if (previousTimePeriod && transitionFactor > 0 && transitionFactor < 1) {
    const fromPalette = TIME_PALETTES[previousTimePeriod];
    palette = {
      ...palette,
      gradient: palette.gradient.map((c, i) =>
        interpolateColor(
          fromPalette.gradient[i % fromPalette.gradient.length],
          c,
          transitionFactor,
        ),
      ),
      bg: interpolateColor(fromPalette.bg, palette.bg, transitionFactor),
      cardBg: interpolateColor(
        fromPalette.cardBg,
        palette.cardBg,
        transitionFactor,
      ),
      text: interpolateColor(fromPalette.text, palette.text, transitionFactor),
      textMuted: interpolateColor(
        fromPalette.textMuted,
        palette.textMuted,
        transitionFactor,
      ),
      accent: interpolateColor(
        fromPalette.accent,
        palette.accent,
        transitionFactor,
      ),
    };
  }

  // Add shadows based on time (with interpolation)
  if (previousTimePeriod && transitionFactor > 0 && transitionFactor < 1) {
    const fromShadows =
      CONFIG.SHADOWS[previousTimePeriod] || CONFIG.SHADOWS.NOON;
    const toShadows = CONFIG.SHADOWS[timePeriod] || CONFIG.SHADOWS.NOON;
    palette.shadows = {
      light: interpolateRgbaColor(
        fromShadows.light,
        toShadows.light,
        transitionFactor,
      ),
      dark: interpolateRgbaColor(
        fromShadows.dark,
        toShadows.dark,
        transitionFactor,
      ),
    };

    // Interpolate gradient angle
    const fromAngle = TIME_PALETTES[previousTimePeriod].gradientAngle;
    const toAngle = TIME_PALETTES[timePeriod].gradientAngle;
    palette.gradientAngle =
      fromAngle + (toAngle - fromAngle) * transitionFactor;

    // Interpolate celestial position
    const fromCelestial = TIME_PALETTES[previousTimePeriod].celestial;
    const toCelestial = TIME_PALETTES[timePeriod].celestial;
    palette.celestial = {
      type: toCelestial.type,
      x: fromCelestial.x + (toCelestial.x - fromCelestial.x) * transitionFactor,
      y: fromCelestial.y + (toCelestial.y - fromCelestial.y) * transitionFactor,
      color: interpolateRgbaColor(
        fromCelestial.color,
        toCelestial.color,
        transitionFactor,
      ),
      glowColor: interpolateRgbaColor(
        fromCelestial.glowColor,
        toCelestial.glowColor,
        transitionFactor,
      ),
    };
  } else {
    palette.shadows = CONFIG.SHADOWS[timePeriod] || CONFIG.SHADOWS.NOON;
    palette.celestial = TIME_PALETTES[timePeriod].celestial;
    palette.gradientAngle = TIME_PALETTES[timePeriod].gradientAngle;
  }

  return palette;
}

/**
 * Apply color palette to CSS variables
 * @param {import('./palette.js').ColorPalette} palette - Color palette to apply
 */
export function applyPaletteToCss(palette) {
  const root = document.documentElement;

  root.style.setProperty("--bg", palette.bg);

  // Update theme-color meta tag for Android system UI
  const themeColorMeta = document.getElementById("theme-color");
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", palette.bg);
  }
  root.style.setProperty("--card-bg", palette.cardBg);
  // Slightly visible card background (very transparent)
  root.style.setProperty("--card-bg-glass", hexToRgba(palette.cardBg, 0.075));
  // Semi-transparent background for neumorphic buttons (blends with background)
  root.style.setProperty("--button-bg", hexToRgba(palette.cardBg, 0.45));
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--text-muted", palette.textMuted);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--shadow-light", palette.shadows.light);
  root.style.setProperty("--shadow-dark", palette.shadows.dark);

  // Glass border - adapt to time period
  const borderColor = hexToRgba(palette.cardBg, 0.3);
  root.style.setProperty("--glass-border", borderColor);

  // Card edge colors for plastic thickness effect
  const cardBgRgb = hexToRgb(palette.cardBg);
  const edgeLight = `rgba(${Math.min(255, cardBgRgb.r + 40)}, ${Math.min(255, cardBgRgb.g + 40)}, ${Math.min(255, cardBgRgb.b + 40)}, 0.25)`;
  const edgeDark = `rgba(${Math.max(0, cardBgRgb.r - 40)}, ${Math.max(0, cardBgRgb.g - 40)}, ${Math.max(0, cardBgRgb.b - 40)}, 0.5)`;
  const edgeDarker = `rgba(${Math.max(0, cardBgRgb.r - 60)}, ${Math.max(0, cardBgRgb.g - 60)}, ${Math.max(0, cardBgRgb.b - 60)}, 0.6)`;
  root.style.setProperty("--card-edge-light", edgeLight);
  root.style.setProperty("--card-edge-dark", edgeDark);
  root.style.setProperty("--card-edge-darker", edgeDarker);

  // Light reflection based on celestial position (sun/moon)
  if (palette.celestial) {
    const { x, y, type, color } = palette.celestial;

    // Convert celestial position to highlight position on card
    // Clamp to 0-100% range for gradient positioning
    const highlightX = Math.max(0, Math.min(100, x * 100));
    const highlightY = Math.max(0, Math.min(100, y * 100));

    // Adjust reflection intensity based on celestial type (stronger values)
    const isMoon = type === "moon";
    const baseOpacity = isMoon ? 0.15 : 0.25;

    // Parse celestial color for highlight tint
    const celestialRgba = parseRgbaColor(color);
    const highlightColor = `rgba(${celestialRgba.r}, ${celestialRgba.g}, ${celestialRgba.b}, ${baseOpacity})`;

    // Create radial gradient from light source position (larger and more visible)
    const highlightGradient = `radial-gradient(
      ellipse 150% 100% at ${highlightX}% ${highlightY}%,
      ${highlightColor} 0%,
      transparent 65%
    )`;
    root.style.setProperty("--card-highlight", highlightGradient);

    // Edge highlight intensity based on light direction (stronger values)
    // Brighter edge on the side facing the light
    const topEdgeOpacity = y < 0.5 ? 0.5 : 0.25;
    const leftEdgeOpacity = x < 0.5 ? 0.45 : 0.2;
    root.style.setProperty(
      "--edge-highlight-top",
      `rgba(255, 255, 255, ${topEdgeOpacity})`,
    );
    root.style.setProperty(
      "--edge-highlight-left",
      `rgba(255, 255, 255, ${leftEdgeOpacity})`,
    );

    // Oil slick angle follows light direction
    const oilslickAngle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90;
    root.style.setProperty("--oilslick-angle", `${oilslickAngle}deg`);

    // Shimmer intensity per time period (brighter backgrounds need stronger shimmer)
    const shimmerIntensity = {
      MORNING: 0.35,
      NOON: 0.25,
      EVENING: 0.3,
      NIGHT: 0.15,
    };
    root.style.setProperty(
      "--shimmer-intensity",
      shimmerIntensity[palette.timePeriod] || 0.25,
    );

    // Oil slick intensity per time period (night is subtle, others are stronger)
    const oilslickIntensity = {
      MORNING: 0.12,
      NOON: 0.14,
      EVENING: 0.15,
      NIGHT: 0.04,
    };
    const intensity = oilslickIntensity[palette.timePeriod] || 0.1;

    const oilslickGradient = `linear-gradient(
      ${oilslickAngle}deg,
      transparent 0%,
      rgba(255, 100, 100, ${intensity * 0.7}) 12%,
      rgba(255, 200, 100, ${intensity}) 24%,
      rgba(200, 255, 100, ${intensity}) 36%,
      rgba(100, 255, 200, ${intensity}) 48%,
      rgba(100, 200, 255, ${intensity}) 60%,
      rgba(150, 100, 255, ${intensity * 0.7}) 72%,
      rgba(255, 100, 200, ${intensity * 0.5}) 84%,
      transparent 100%
    )`;
    root.style.setProperty("--oilslick-gradient", oilslickGradient);

    // Text shadow colors per time period
    // Light modes: white highlight above, dark shadow below (emboss)
    // Night mode: subtle glow effect with dark shadow above (inverted for light text)
    const textShadowConfig = {
      MORNING: {
        highlightColor: "rgba(255, 255, 255, 0.8)",
        shadowColor: "rgba(0, 0, 0, 0.15)",
        highlightOffset: "0 2px 1px",
        shadowOffset: "0 -1px 1px",
        // Subtle for body text
        highlightColorSubtle: "rgba(255, 255, 255, 0.35)",
        shadowColorSubtle: "rgba(0, 0, 0, 0.06)",
        highlightOffsetSubtle: "0 1px 0",
        shadowOffsetSubtle: "0 -1px 0",
      },
      NOON: {
        highlightColor: "rgba(255, 255, 255, 0.8)",
        shadowColor: "rgba(0, 0, 0, 0.12)",
        highlightOffset: "0 2px 1px",
        shadowOffset: "0 -1px 1px",
        highlightColorSubtle: "rgba(255, 255, 255, 0.35)",
        shadowColorSubtle: "rgba(0, 0, 0, 0.05)",
        highlightOffsetSubtle: "0 1px 0",
        shadowOffsetSubtle: "0 -1px 0",
      },
      EVENING: {
        highlightColor: "rgba(255, 240, 220, 0.7)",
        shadowColor: "rgba(0, 0, 0, 0.18)",
        highlightOffset: "0 2px 1px",
        shadowOffset: "0 -1px 1px",
        highlightColorSubtle: "rgba(255, 240, 220, 0.3)",
        shadowColorSubtle: "rgba(0, 0, 0, 0.08)",
        highlightOffsetSubtle: "0 1px 0",
        shadowOffsetSubtle: "0 -1px 0",
      },
      NIGHT: {
        // Night uses glow + drop shadow instead of emboss
        highlightColor: "rgba(80, 120, 180, 0.5)",
        shadowColor: "rgba(0, 0, 0, 0.7)",
        highlightOffset: "0 0 8px",
        shadowOffset: "0 2px 4px",
        highlightColorSubtle: "rgba(80, 120, 180, 0.3)",
        shadowColorSubtle: "rgba(0, 0, 0, 0.5)",
        highlightOffsetSubtle: "0 0 4px",
        shadowOffsetSubtle: "0 1px 2px",
      },
    };

    const tsConfig =
      textShadowConfig[palette.timePeriod] || textShadowConfig.NOON;
    root.style.setProperty("--text-highlight-color", tsConfig.highlightColor);
    root.style.setProperty("--text-shadow-color", tsConfig.shadowColor);
    root.style.setProperty("--text-highlight-offset", tsConfig.highlightOffset);
    root.style.setProperty("--text-shadow-offset", tsConfig.shadowOffset);
    // Subtle variants for body text
    root.style.setProperty(
      "--text-highlight-color-subtle",
      tsConfig.highlightColorSubtle,
    );
    root.style.setProperty(
      "--text-shadow-color-subtle",
      tsConfig.shadowColorSubtle,
    );
    root.style.setProperty(
      "--text-highlight-offset-subtle",
      tsConfig.highlightOffsetSubtle,
    );
    root.style.setProperty(
      "--text-shadow-offset-subtle",
      tsConfig.shadowOffsetSubtle,
    );

    // Icon deboss colors per time period
    const iconDebossConfig = {
      MORNING: {
        shadow: "rgba(0, 0, 0, 0.3)",
        highlight: "rgba(255, 255, 255, 0.7)",
      },
      NOON: {
        shadow: "rgba(0, 0, 0, 0.25)",
        highlight: "rgba(255, 255, 255, 0.7)",
      },
      EVENING: {
        shadow: "rgba(0, 0, 0, 0.35)",
        highlight: "rgba(255, 240, 220, 0.65)",
      },
      NIGHT: {
        // Night: swap roles - subtle glow on top, drop shadow below
        shadow: "rgba(80, 120, 180, 0.25)",
        highlight: "rgba(0, 0, 0, 0.6)",
      },
    };

    const iconConfig =
      iconDebossConfig[palette.timePeriod] || iconDebossConfig.NOON;
    root.style.setProperty("--icon-shadow-color", iconConfig.shadow);
    root.style.setProperty("--icon-highlight-color", iconConfig.highlight);

    // Fresnel effect per time period (edge glow)
    const fresnelConfig = {
      MORNING: `radial-gradient(
        ellipse 70% 60% at 50% 50%,
        transparent 0%,
        transparent 60%,
        rgba(255, 255, 245, 0.06) 80%,
        rgba(255, 255, 245, 0.12) 95%,
        rgba(255, 255, 245, 0.18) 100%
      )`,
      NOON: `radial-gradient(
        ellipse 70% 60% at 50% 50%,
        transparent 0%,
        transparent 60%,
        rgba(255, 255, 255, 0.06) 80%,
        rgba(255, 255, 255, 0.12) 95%,
        rgba(255, 255, 255, 0.18) 100%
      )`,
      EVENING: `radial-gradient(
        ellipse 70% 60% at 50% 50%,
        transparent 0%,
        transparent 60%,
        rgba(255, 240, 230, 0.05) 80%,
        rgba(255, 240, 230, 0.1) 95%,
        rgba(255, 240, 230, 0.15) 100%
      )`,
      NIGHT: `radial-gradient(
        ellipse 70% 60% at 50% 50%,
        transparent 0%,
        transparent 60%,
        rgba(100, 120, 160, 0.04) 80%,
        rgba(100, 120, 160, 0.08) 95%,
        rgba(100, 120, 160, 0.12) 100%
      )`,
    };
    root.style.setProperty(
      "--fresnel-gradient",
      fresnelConfig[palette.timePeriod] || fresnelConfig.NOON,
    );
  }
}
