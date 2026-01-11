/**
 * Background Animation System - Debug Panel
 *
 * Temporary debug panel for testing different conditions.
 * DELETE THIS FILE when done testing.
 */

import { setDebugConditions, TIME_PERIOD } from "./index.js";

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
    };
    this.isAutoMode = true;
    this.panel = null;
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
        <span style="${LABEL_STYLES}">Card Actions</span>
        <div style="${BUTTON_GROUP_STYLES}">
          <button id="debug-flip" style="${BUTTON_STYLES}">Flip</button>
          <button id="debug-hint" style="${BUTTON_STYLES}">Hint Anim</button>
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

    // Reset button
    this.panel.querySelector("#debug-reset").addEventListener("click", () => {
      this.reset();
    });

    // Close button
    this.panel.querySelector("#debug-close").addEventListener("click", () => {
      this.panel.style.display = "none";
    });

    // Flip button
    this.panel.querySelector("#debug-flip").addEventListener("click", () => {
      const card = document.querySelector(".card");
      if (card) {
        card.classList.add("flipping");
        card.classList.toggle("flipped");
        setTimeout(() => card.classList.remove("flipping"), 600);
      }
    });

    // Hint animation button
    this.panel.querySelector("#debug-hint").addEventListener("click", () => {
      const card = document.querySelector(".card");
      if (card && !card.classList.contains("hint")) {
        card.classList.add("hint");
        card.addEventListener(
          "animationend",
          () => card.classList.remove("hint"),
          { once: true },
        );
      }
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

    const options = {};
    if (this.currentState.timePeriod)
      options.timePeriod = this.currentState.timePeriod;

    setDebugConditions(options);
  }

  updateStatus() {
    const statusEl = this.panel.querySelector("#debug-status");
    if (this.isAutoMode) {
      statusEl.textContent = "Mode: Auto";
      statusEl.style.color = "#666";
    } else {
      statusEl.textContent = `Debug: ${this.currentState.timePeriod || "Auto"}`;
      statusEl.style.color = "#7cb3ff";
    }
  }

  reset() {
    this.currentState = {
      timePeriod: null,
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

// Initialize debug panel only when #debug is in URL
const debugPanel = new DebugPanel();

if (window.location.hash === "#debug") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => debugPanel.init());
  } else {
    debugPanel.init();
  }
}

export { debugPanel };
