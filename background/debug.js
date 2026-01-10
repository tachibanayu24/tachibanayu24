/**
 * Background Animation System - Debug Panel
 *
 * Temporary debug panel for testing different conditions.
 * DELETE THIS FILE when done testing.
 */

import {
  setDebugConditions,
  TIME_PERIOD,
  SEASON,
  WEATHER_TYPE,
} from "./index.js";

const PANEL_STYLES = `
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12px;
  color: #fff;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  max-width: 320px;
`;

const SECTION_STYLES = `
  margin-bottom: 0.75rem;
`;

const LABEL_STYLES = `
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
  margin-bottom: 0.5rem;
`;

const BUTTON_GROUP_STYLES = `
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
`;

const BUTTON_STYLES = `
  padding: 0.4rem 0.6rem;
  border: none;
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: #ddd;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
`;

const BUTTON_ACTIVE_STYLES = `
  background: rgba(100, 150, 255, 0.4);
  color: #fff;
`;

const RESET_BUTTON_STYLES = `
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: transparent;
  color: #aaa;
  font-size: 11px;
  cursor: pointer;
  margin-top: 0.5rem;
  font-family: inherit;
`;

const HEADER_STYLES = `
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CLOSE_BUTTON_STYLES = `
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  line-height: 1;
`;

class DebugPanel {
  constructor() {
    this.currentState = {
      timePeriod: null,
      season: null,
      weatherType: null,
    };
    this.isAutoMode = true;
    this.panel = null;
    this.buttons = {};
  }

  init() {
    this.createPanel();
    this.attachEventListeners();
    console.log(
      "[Debug] Debug panel initialized. Use buttons to test different conditions.",
    );
  }

  createPanel() {
    this.panel = document.createElement("div");
    this.panel.id = "bg-debug-panel";
    this.panel.style.cssText = PANEL_STYLES;

    this.panel.innerHTML = `
      <div style="${HEADER_STYLES}">
        <span>Background Debug</span>
        <button id="debug-close" style="${CLOSE_BUTTON_STYLES}">&times;</button>
      </div>

      <div style="${SECTION_STYLES}">
        <span style="${LABEL_STYLES}">Time Period</span>
        <div style="${BUTTON_GROUP_STYLES}" data-group="time">
          <button data-time="MORNING" style="${BUTTON_STYLES}">Morning</button>
          <button data-time="NOON" style="${BUTTON_STYLES}">Noon</button>
          <button data-time="EVENING" style="${BUTTON_STYLES}">Evening</button>
          <button data-time="NIGHT" style="${BUTTON_STYLES}">Night</button>
        </div>
      </div>

      <div style="${SECTION_STYLES}">
        <span style="${LABEL_STYLES}">Season</span>
        <div style="${BUTTON_GROUP_STYLES}" data-group="season">
          <button data-season="SPRING" style="${BUTTON_STYLES}">Spring</button>
          <button data-season="SUMMER" style="${BUTTON_STYLES}">Summer</button>
          <button data-season="AUTUMN" style="${BUTTON_STYLES}">Autumn</button>
          <button data-season="WINTER" style="${BUTTON_STYLES}">Winter</button>
        </div>
      </div>

      <div style="${SECTION_STYLES}">
        <span style="${LABEL_STYLES}">Weather</span>
        <div style="${BUTTON_GROUP_STYLES}" data-group="weather">
          <button data-weather="CLEAR" style="${BUTTON_STYLES}">Clear</button>
          <button data-weather="CLOUDS" style="${BUTTON_STYLES}">Clouds</button>
          <button data-weather="RAIN" style="${BUTTON_STYLES}">Rain</button>
          <button data-weather="SNOW" style="${BUTTON_STYLES}">Snow</button>
        </div>
      </div>

      <div style="font-size: 10px; color: #666; margin-bottom: 0.5rem;" id="debug-status">
        Mode: Auto
      </div>

      <button id="debug-reset" style="${RESET_BUTTON_STYLES}">
        Reset to Auto
      </button>
    `;

    document.body.appendChild(this.panel);
  }

  attachEventListeners() {
    // Time buttons
    this.panel.querySelectorAll("[data-time]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentState.timePeriod = TIME_PERIOD[btn.dataset.time];
        this.updateActiveStates("time", btn);
        this.applyDebugState();
      });
    });

    // Season buttons
    this.panel.querySelectorAll("[data-season]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentState.season = SEASON[btn.dataset.season];
        this.updateActiveStates("season", btn);
        this.applyDebugState();
      });
    });

    // Weather buttons
    this.panel.querySelectorAll("[data-weather]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentState.weatherType = WEATHER_TYPE[btn.dataset.weather];
        this.updateActiveStates("weather", btn);
        this.applyDebugState();
      });
    });

    // Reset button
    this.panel.querySelector("#debug-reset").addEventListener("click", () => {
      this.reset();
    });

    // Close button
    this.panel.querySelector("#debug-close").addEventListener("click", () => {
      this.panel.style.display = "none";
    });

    // Keyboard shortcut to toggle panel (Ctrl+Shift+D)
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        this.panel.style.display =
          this.panel.style.display === "none" ? "block" : "none";
      }
    });
  }

  updateActiveStates(group, activeBtn) {
    const groupEl = this.panel.querySelector(`[data-group="${group}"]`);
    groupEl.querySelectorAll("button").forEach((btn) => {
      btn.style.cssText = BUTTON_STYLES;
    });
    activeBtn.style.cssText = BUTTON_STYLES + BUTTON_ACTIVE_STYLES;
  }

  applyDebugState() {
    this.isAutoMode = false;
    this.updateStatus();

    // Only pass values that have been selected
    const options = {};
    if (this.currentState.timePeriod)
      options.timePeriod = this.currentState.timePeriod;
    if (this.currentState.season) options.season = this.currentState.season;
    if (this.currentState.weatherType)
      options.weatherType = this.currentState.weatherType;

    setDebugConditions(options);
  }

  updateStatus() {
    const statusEl = this.panel.querySelector("#debug-status");
    if (this.isAutoMode) {
      statusEl.textContent = "Mode: Auto";
      statusEl.style.color = "#666";
    } else {
      const parts = [];
      if (this.currentState.timePeriod)
        parts.push(this.currentState.timePeriod);
      if (this.currentState.season) parts.push(this.currentState.season);
      if (this.currentState.weatherType)
        parts.push(this.currentState.weatherType);
      statusEl.textContent = `Debug: ${parts.join(" / ")}`;
      statusEl.style.color = "#7cb3ff";
    }
  }

  reset() {
    this.currentState = {
      timePeriod: null,
      season: null,
      weatherType: null,
    };
    this.isAutoMode = true;

    // Clear all active states
    this.panel.querySelectorAll("[data-group] button").forEach((btn) => {
      btn.style.cssText = BUTTON_STYLES;
    });

    this.updateStatus();

    // Reload page to reset to auto mode
    window.location.reload();
  }

  destroy() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }
}

// Initialize debug panel
const debugPanel = new DebugPanel();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => debugPanel.init());
} else {
  debugPanel.init();
}

export { debugPanel };
