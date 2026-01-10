/**
 * Background Animation System - Season Module
 *
 * Determines the current season based on date.
 * Uses Northern Hemisphere season calculation.
 */

export const SEASON = {
  SPRING: "SPRING",
  SUMMER: "SUMMER",
  AUTUMN: "AUTUMN",
  WINTER: "WINTER",
};

// Approximate season boundaries (day of year)
const SEASON_BOUNDARIES = {
  SPRING_START: 80, // ~March 21
  SUMMER_START: 172, // ~June 21
  AUTUMN_START: 266, // ~September 23
  WINTER_START: 355, // ~December 21
};

/**
 * Get day of year (1-366)
 * @param {Date} date
 * @returns {number}
 */
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Get current season based on date
 * @returns {string} One of SEASON values
 */
export function getSeason() {
  const day = getDayOfYear();

  if (
    day >= SEASON_BOUNDARIES.SPRING_START &&
    day < SEASON_BOUNDARIES.SUMMER_START
  ) {
    return SEASON.SPRING;
  } else if (
    day >= SEASON_BOUNDARIES.SUMMER_START &&
    day < SEASON_BOUNDARIES.AUTUMN_START
  ) {
    return SEASON.SUMMER;
  } else if (
    day >= SEASON_BOUNDARIES.AUTUMN_START &&
    day < SEASON_BOUNDARIES.WINTER_START
  ) {
    return SEASON.AUTUMN;
  } else {
    return SEASON.WINTER;
  }
}

/**
 * Get season progress (0-1) within the current season
 * @returns {number}
 */
export function getSeasonProgress() {
  const day = getDayOfYear();
  const season = getSeason();

  const boundaries = {
    [SEASON.SPRING]: [
      SEASON_BOUNDARIES.SPRING_START,
      SEASON_BOUNDARIES.SUMMER_START,
    ],
    [SEASON.SUMMER]: [
      SEASON_BOUNDARIES.SUMMER_START,
      SEASON_BOUNDARIES.AUTUMN_START,
    ],
    [SEASON.AUTUMN]: [
      SEASON_BOUNDARIES.AUTUMN_START,
      SEASON_BOUNDARIES.WINTER_START,
    ],
    [SEASON.WINTER]: [
      SEASON_BOUNDARIES.WINTER_START,
      SEASON_BOUNDARIES.SPRING_START + 365,
    ],
  };

  const [start, end] = boundaries[season];
  let adjustedDay = day;

  // Handle winter spanning year boundary
  if (season === SEASON.WINTER && day < SEASON_BOUNDARIES.SPRING_START) {
    adjustedDay = day + 365;
  }

  return (adjustedDay - start) / (end - start);
}

/**
 * Get season-specific visual characteristics
 * @param {string} season
 * @returns {{ hueShift: number, saturation: number, motif: string }}
 */
export function getSeasonCharacteristics(season) {
  switch (season) {
    case SEASON.SPRING:
      return {
        hueShift: -10,
        saturation: 1.1,
        motif: "petal",
        colorAccent: "rgba(255, 182, 193, 0.3)",
      };
    case SEASON.SUMMER:
      return {
        hueShift: 10,
        saturation: 1.2,
        motif: "wave",
        colorAccent: "rgba(135, 206, 235, 0.3)",
      };
    case SEASON.AUTUMN:
      return {
        hueShift: 25,
        saturation: 1.0,
        motif: "leaf",
        colorAccent: "rgba(210, 105, 30, 0.3)",
      };
    case SEASON.WINTER:
      return {
        hueShift: -20,
        saturation: 0.8,
        motif: "crystal",
        colorAccent: "rgba(176, 224, 230, 0.3)",
      };
    default:
      return {
        hueShift: 0,
        saturation: 1.0,
        motif: "default",
        colorAccent: "rgba(180, 180, 200, 0.3)",
      };
  }
}
