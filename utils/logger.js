/**
 * Logging Utilities
 *
 * Provides a unified logging interface that respects debug mode.
 * Logs are only output when #debug is in the URL hash.
 */

/**
 * Check if debug mode is enabled
 * @returns {boolean}
 */
function isDebugMode() {
  return typeof window !== "undefined" && window.location.hash === "#debug";
}

/**
 * Create a namespaced logger
 * @param {string} namespace - Logger namespace (e.g., 'Background', 'CardEffects')
 * @returns {{log: Function, warn: Function, error: Function}}
 */
export function createLogger(namespace) {
  const prefix = `[${namespace}]`;

  return {
    /**
     * Log a message (only in debug mode)
     * @param {...any} args - Arguments to log
     */
    log: (...args) => {
      if (isDebugMode()) {
        console.log(prefix, ...args);
      }
    },

    /**
     * Log a warning (always shown)
     * @param {...any} args - Arguments to log
     */
    warn: (...args) => {
      console.warn(prefix, ...args);
    },

    /**
     * Log an error (always shown)
     * @param {...any} args - Arguments to log
     */
    error: (...args) => {
      console.error(prefix, ...args);
    },
  };
}
