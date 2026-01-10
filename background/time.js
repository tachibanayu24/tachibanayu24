/**
 * Background Animation System - Time Module
 *
 * Determines the current time period based on user's local time.
 * Returns normalized values for smooth transitions.
 */

import { CONFIG } from "./config.js";

/**
 * @typedef {'MORNING'|'NOON'|'EVENING'|'NIGHT'} TimePeriodKey
 */

/**
 * @typedef {Object} TimeTransition
 * @property {TimePeriodKey} from - The time period transitioning from
 * @property {TimePeriodKey} to - The time period transitioning to
 * @property {number} factor - Transition factor (0-1)
 */

/**
 * Time period constants
 * @type {Object<string, TimePeriodKey>}
 */
export const TIME_PERIOD = {
  MORNING: "MORNING",
  NOON: "NOON",
  EVENING: "EVENING",
  NIGHT: "NIGHT",
};

/**
 * Get the current time period based on local time
 * @returns {string} One of TIME_PERIOD values
 */
export function getTimePeriod() {
  const hour = new Date().getHours();
  const { TIME_PERIODS } = CONFIG;

  if (hour >= TIME_PERIODS.MORNING.start && hour < TIME_PERIODS.MORNING.end) {
    return TIME_PERIOD.MORNING;
  }
  if (hour >= TIME_PERIODS.NOON.start && hour < TIME_PERIODS.NOON.end) {
    return TIME_PERIOD.NOON;
  }
  if (hour >= TIME_PERIODS.EVENING.start && hour < TIME_PERIODS.EVENING.end) {
    return TIME_PERIOD.EVENING;
  }
  return TIME_PERIOD.NIGHT;
}

/**
 * Get transition factor between time periods (0-1)
 * Returns higher values near period boundaries for smooth transitions
 * @returns {{ from: string, to: string, factor: number }}
 */
export function getTimeTransition() {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hour + minutes / 60;
  const { TIME_PERIODS } = CONFIG;

  const transitionWindow = 0.5; // 30 minutes transition window

  // Check if we're near a transition point
  const transitions = [
    {
      boundary: TIME_PERIODS.MORNING.start,
      from: TIME_PERIOD.NIGHT,
      to: TIME_PERIOD.MORNING,
    },
    {
      boundary: TIME_PERIODS.NOON.start,
      from: TIME_PERIOD.MORNING,
      to: TIME_PERIOD.NOON,
    },
    {
      boundary: TIME_PERIODS.EVENING.start,
      from: TIME_PERIOD.NOON,
      to: TIME_PERIOD.EVENING,
    },
    {
      boundary: TIME_PERIODS.NIGHT.start,
      from: TIME_PERIOD.EVENING,
      to: TIME_PERIOD.NIGHT,
    },
  ];

  for (const { boundary, from, to } of transitions) {
    let distance = currentTime - boundary;

    // Handle midnight crossing for NIGHT -> MORNING transition
    // If we're in early morning hours (0-5) and checking MORNING boundary (5),
    // the calculation works normally.
    // If we're late at night (23.5+) and boundary is early morning,
    // we need to adjust for the day wrap.
    if (boundary < 6 && currentTime > 20) {
      // Late night, approaching next day's morning
      distance = currentTime - (boundary + 24);
    }

    if (Math.abs(distance) <= transitionWindow) {
      // Smooth easing function
      const factor = (distance + transitionWindow) / (transitionWindow * 2);
      return {
        from,
        to,
        factor: easeInOutCubic(Math.max(0, Math.min(1, factor))),
      };
    }
  }

  // Not in transition, return current period
  const current = getTimePeriod();
  return { from: current, to: current, factor: 1 };
}

/**
 * Easing function for smooth transitions
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
