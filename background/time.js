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
 * Get current time period (no transition, instant change)
 * @returns {{ from: string, to: string, factor: number }}
 */
export function getTimeTransition() {
  const current = getTimePeriod();
  return { from: current, to: current, factor: 1 };
}
