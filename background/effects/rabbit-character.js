/**
 * Background Animation System - Rabbit Character (Pixel Art Style)
 *
 * Interactive pixel art rabbit that changes behavior based on time of day.
 * Always visible in the corner of the screen.
 */

import { TIME_PERIOD } from "../time.js";
import { CONFIG } from "../config.js";

/**
 * @typedef {'idle'|'jumping'|'eating'|'sitting'|'sleeping'|'angry'} RabbitState
 */

/**
 * @typedef {Object} Heart
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} opacity - Current opacity
 * @property {number} startTime - Animation start time
 */

// Pixel art sprite data for lop-eared rabbit "Hokori" (垂れ耳うさぎ「ほこり」)
// Based on actual photo of Hokori - 25x18 pixels
// 0 = transparent, 1 = white/cream (body), 2 = light gray (ears - subtle)
// 3 = eye (black), 4 = nose (pink/beige), 5 = closed eye
// Features: round fluffy body, lop ears with gray at top center flowing to sides
// Width: 25 (odd number for centering), center column = 12
// Eyes at columns 6 and 18 (outer position like herbivore), row 6
// Nose at columns 11 and 13 (1 pixel gap), row 8
// Feet at columns 6-8 and 16-18 (wider spacing), row 16
const SPRITE_IDLE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 0],
  [0, 2, 2, 2, 2, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 2, 2, 2, 2, 0],
  [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0],
  [0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const SPRITE_JUMP = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 0],
  [0, 2, 2, 2, 2, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 2, 2, 2, 2, 0],
  [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0],
  [0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const SPRITE_EAT = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 0],
  [0, 2, 2, 2, 2, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 2, 2, 2, 2, 0],
  [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0],
  [0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const SPRITE_SLEEP = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 0],
  [0, 2, 2, 2, 2, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 2, 2, 2, 2, 0],
  [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0],
  [0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Angry state for night time (doesn't want to be woken up) - same as IDLE, anger mark floats above
const SPRITE_ANGRY = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0, 0],
  [0, 2, 2, 2, 2, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 2, 2, 2, 2, 0],
  [2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 4, 1, 4, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
  [0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 0],
  [0, 0, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const SPRITE_WIDTH = 25;
const SPRITE_HEIGHT = 18;

/**
 * Rabbit Character - Interactive pixel art mascot
 */
export class RabbitCharacter {
  constructor() {
    /** @type {RabbitState} */
    this.state = "idle";
    /** @type {string} */
    this.timePeriod = TIME_PERIOD.NOON;
    /** @type {number} */
    this.time = 0;
    /** @type {number} */
    this.x = 0;
    /** @type {number} */
    this.y = 0;
    /** @type {number} */
    this.pixelSize = 5;
    /** @type {number} */
    this.animFrame = 0;
    /** @type {boolean} */
    this.isClicking = false;
    /** @type {number} */
    this.clickStartTime = 0;
    /** @type {number} */
    this.jumpOffset = 0;
    /** @type {Heart[]} */
    this.hearts = [];
    /** @type {Heart[]} */
    this.angerMarks = [];
    /** @type {number} */
    this.width = window.innerWidth;
    /** @type {number} */
    this.height = window.innerHeight;
    /** @type {HTMLElement|null} */
    this.hitArea = null;

    this.updatePosition();
    this.createHitArea();
  }

  /**
   * Create invisible hit area element to block touch events
   */
  createHitArea() {
    this.hitArea = document.createElement("div");
    this.hitArea.id = "rabbit-hit-area";
    this.hitArea.style.cssText = `
      position: fixed;
      z-index: 100;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    `;
    document.body.appendChild(this.hitArea);
    this.updateHitAreaPosition();

    // Handle click/touch on hit area
    this.hitArea.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClick();
    });
  }

  /**
   * Update hit area position and size
   */
  updateHitAreaPosition() {
    if (!this.hitArea) return;

    const padding = 15;
    const w = this.getSpriteWidth() + padding * 2;
    const h = this.getSpriteHeight() + padding * 2;

    const { RABBIT } = CONFIG.EFFECTS;
    const { MOBILE_BREAKPOINT } = CONFIG.SCREEN;
    const isMobile = this.width < MOBILE_BREAKPOINT;
    const pos = isMobile ? RABBIT.POSITION.mobile : RABBIT.POSITION.desktop;

    this.hitArea.style.left = `${pos.left - padding}px`;
    this.hitArea.style.bottom = `${pos.bottom - padding}px`;
    this.hitArea.style.width = `${w}px`;
    this.hitArea.style.height = `${h}px`;
  }

  /**
   * Update position based on screen size
   */
  updatePosition() {
    const { RABBIT } = CONFIG.EFFECTS;
    const { MOBILE_BREAKPOINT } = CONFIG.SCREEN;
    const isMobile = this.width < MOBILE_BREAKPOINT;

    // Pixel size for sprite rendering (fixed size for all devices)
    this.pixelSize = 2.5;
    const pos = isMobile ? RABBIT.POSITION.mobile : RABBIT.POSITION.desktop;

    const spriteWidth = SPRITE_WIDTH * this.pixelSize;
    const spriteHeight = SPRITE_HEIGHT * this.pixelSize;

    this.x = pos.left + spriteWidth / 2;
    this.y = this.height - pos.bottom - spriteHeight / 2;
  }

  /**
   * Handle window resize
   */
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.updatePosition();
    this.updateHitAreaPosition();
  }

  /**
   * Set current time period and update state
   * @param {string} timePeriod
   */
  setTimePeriod(timePeriod) {
    this.timePeriod = timePeriod;
    this.updateStateForTimePeriod();
  }

  /**
   * Update rabbit state based on time period
   */
  updateStateForTimePeriod() {
    if (this.isClicking) return;

    switch (this.timePeriod) {
      case TIME_PERIOD.MORNING:
        this.state = "jumping";
        break;
      case TIME_PERIOD.NOON:
        this.state = "eating";
        break;
      case TIME_PERIOD.EVENING:
        this.state = "sitting";
        break;
      case TIME_PERIOD.NIGHT:
        this.state = "sleeping";
        break;
      default:
        this.state = "idle";
    }
  }

  /**
   * Get sprite width in pixels
   */
  getSpriteWidth() {
    return SPRITE_WIDTH * this.pixelSize;
  }

  /**
   * Get sprite height in pixels
   */
  getSpriteHeight() {
    return SPRITE_HEIGHT * this.pixelSize;
  }

  /**
   * Check if point is inside rabbit hitbox
   * @param {number} px - Point X
   * @param {number} py - Point Y
   * @returns {boolean}
   */
  isPointInside(px, py) {
    const w = this.getSpriteWidth();
    const h = this.getSpriteHeight();
    const hitPadding = 10;

    return (
      px >= this.x - w / 2 - hitPadding &&
      px <= this.x + w / 2 + hitPadding &&
      py >= this.y - h / 2 - this.jumpOffset - hitPadding &&
      py <= this.y + h / 2 - this.jumpOffset + hitPadding
    );
  }

  /**
   * Handle click/tap interaction
   */
  onClick() {
    const { RABBIT } = CONFIG.EFFECTS;

    // At night, rabbit gets angry instead of jumping (don't wake me up!)
    if (this.timePeriod === TIME_PERIOD.NIGHT) {
      this.isClicking = true;
      this.clickStartTime = this.time;
      this.state = "angry";

      // Spawn anger mark instead of heart
      this.angerMarks.push({
        x: this.x + this.getSpriteWidth() / 2,
        y: this.y - this.getSpriteHeight() / 2,
        opacity: 1,
        startTime: this.time,
      });

      // Reset after animation (shorter duration for anger)
      setTimeout(() => {
        this.isClicking = false;
        this.updateStateForTimePeriod();
      }, RABBIT.CLICK_JUMP_DURATION * 0.8);
      return;
    }

    this.isClicking = true;
    this.clickStartTime = this.time;
    this.state = "jumping";

    // Spawn heart
    this.hearts.push({
      x: this.x,
      y: this.y - this.getSpriteHeight() / 2 - this.jumpOffset,
      opacity: 1,
      startTime: this.time,
    });

    // Reset after animation
    setTimeout(() => {
      this.isClicking = false;
      this.updateStateForTimePeriod();
    }, RABBIT.CLICK_JUMP_DURATION);
  }

  /**
   * Update animation state
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.time += deltaTime;
    const { RABBIT } = CONFIG.EFFECTS;

    // Animation frame update
    this.animFrame = Math.floor(this.time * 0.005) % 2;

    // Jump animation
    if (this.state === "jumping") {
      this.jumpOffset =
        Math.abs(Math.sin(this.time * RABBIT.JUMP_SPEED)) * RABBIT.JUMP_HEIGHT;
    } else {
      this.jumpOffset = 0;
    }

    // Click jump animation (override) - but not when angry (night time)
    if (this.isClicking && this.state !== "angry") {
      const elapsed = this.time - this.clickStartTime;
      const progress = Math.min(elapsed / RABBIT.CLICK_JUMP_DURATION, 1);
      this.jumpOffset = Math.sin(progress * Math.PI) * RABBIT.CLICK_JUMP_HEIGHT;
    }

    // Update hearts
    this.hearts = this.hearts.filter((heart) => {
      const elapsed = this.time - heart.startTime;
      heart.y -= deltaTime * 0.05;
      heart.opacity = 1 - elapsed / RABBIT.HEART_DURATION;
      return heart.opacity > 0;
    });

    // Update anger marks
    this.angerMarks = this.angerMarks.filter((mark) => {
      const elapsed = this.time - mark.startTime;
      mark.opacity = 1 - elapsed / (RABBIT.HEART_DURATION * 0.8);
      return mark.opacity > 0;
    });
  }

  /**
   * Get colors for current time period
   * Hokori has broken color pattern (white + gray/brown markings)
   */
  getColors() {
    const { RABBIT } = CONFIG.EFFECTS;
    const colors = RABBIT.COLORS[this.timePeriod] || RABBIT.COLORS.NOON;

    return {
      body: colors.body,
      // Light gray ears
      pattern: colors.accent,
      eye: this.timePeriod === TIME_PERIOD.NIGHT ? colors.accent : "#333",
      // Dark grayish brown nose holes
      nose: colors.nose || "rgba(90, 75, 65, 0.9)",
      closedEye: colors.body,
    };
  }

  /**
   * Get current sprite based on state
   */
  getCurrentSprite() {
    switch (this.state) {
      case "jumping":
        return this.animFrame === 0 ? SPRITE_JUMP : SPRITE_IDLE;
      case "eating":
        return this.animFrame === 0 ? SPRITE_EAT : SPRITE_IDLE;
      case "sleeping":
        return SPRITE_SLEEP;
      case "angry":
        return SPRITE_ANGRY;
      case "sitting":
      case "idle":
      default:
        return SPRITE_IDLE;
    }
  }

  /**
   * Draw rabbit on canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const sprite = this.getCurrentSprite();
    const colors = this.getColors();
    const ps = this.pixelSize;

    const startX = this.x - (SPRITE_WIDTH * ps) / 2;
    const startY = this.y - (SPRITE_HEIGHT * ps) / 2 - this.jumpOffset;

    ctx.save();

    // Draw pixel art shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    const shadowY = this.y + (SPRITE_HEIGHT * ps) / 2 + ps;
    const shadowWidth = Math.floor(SPRITE_WIDTH * 0.6);
    const shadowStartX = this.x - (shadowWidth * ps) / 2;
    // Simple pixel shadow pattern (flattened ellipse shape)
    const shadowPattern = [
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ];
    for (let row = 0; row < shadowPattern.length; row++) {
      for (let col = 0; col < shadowPattern[row].length; col++) {
        if (shadowPattern[row][col] === 1) {
          ctx.fillRect(shadowStartX + col * ps, shadowY + row * ps, ps, ps);
        }
      }
    }

    // Draw sprite pixels
    for (let row = 0; row < SPRITE_HEIGHT; row++) {
      for (let col = 0; col < SPRITE_WIDTH; col++) {
        const pixel = sprite[row][col];
        if (pixel === 0) continue;

        let color;
        switch (pixel) {
          case 1:
            color = colors.body;
            break;
          case 2:
            // Broken color pattern (gray/brown markings)
            color = colors.pattern;
            break;
          case 3:
            color = colors.eye;
            break;
          case 4:
            color = colors.nose;
            break;
          case 5:
            color = colors.closedEye;
            break;
          default:
            color = colors.body;
        }

        ctx.fillStyle = color;
        ctx.fillRect(startX + col * ps, startY + row * ps, ps, ps);
      }
    }

    // Draw hearts
    this.drawHearts(ctx);

    // Draw anger marks 💢
    this.drawAngerMarks(ctx);

    // Draw ZZZ for sleeping state
    if (this.state === "sleeping") {
      this.drawZzz(ctx, startX + SPRITE_WIDTH * ps + 5, startY);
    }

    ctx.restore();
  }

  /**
   * Draw floating hearts (pixel style)
   * @param {CanvasRenderingContext2D} ctx
   */
  drawHearts(ctx) {
    const ps = Math.max(3, this.pixelSize);

    // Pixel heart pattern
    const heartPattern = [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ];

    for (const heart of this.hearts) {
      ctx.save();
      ctx.globalAlpha = heart.opacity;

      const hx = heart.x - (5 * ps) / 2;
      const hy = heart.y - (5 * ps) / 2;

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (heartPattern[row][col] === 1) {
            ctx.fillStyle = "#ff6b6b";
            ctx.fillRect(hx + col * ps, hy + row * ps, ps, ps);
          }
        }
      }

      ctx.restore();
    }
  }

  /**
   * Draw ZZZ for sleeping state (pixel style)
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   */
  drawZzz(ctx, x, y) {
    const phase = (this.time * 0.002) % 3;
    const colors = this.getColors();
    const ps = Math.max(3, this.pixelSize - 1);

    // Z pattern
    const zPattern = [
      [1, 1, 1],
      [0, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1],
    ];

    const drawZ = (zx, zy, alpha, scale = 1) => {
      ctx.globalAlpha = alpha;
      const zps = ps * scale;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          if (zPattern[row][col] === 1) {
            ctx.fillStyle = colors.body;
            ctx.fillRect(zx + col * zps, zy + row * zps, zps, zps);
          }
        }
      }
    };

    ctx.save();

    if (phase > 0) {
      drawZ(x, y, Math.min(phase, 1), 0.8);
    }
    if (phase > 1) {
      drawZ(x + ps * 4, y - ps * 6, Math.min(phase - 1, 1), 1);
    }
    if (phase > 2) {
      drawZ(x + ps * 9, y - ps * 12, Math.min(phase - 2, 1), 1.2);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /**
   * Draw anger marks 💢 (pixel style - Japanese manga veins)
   * @param {CanvasRenderingContext2D} ctx
   */
  drawAngerMarks(ctx) {
    const ps = Math.max(3, this.pixelSize);

    // Pixel anger mark pattern (💢 style - 4 curved lines bending outward)
    //   █    █
    //   █    █
    // ███    ███
    //
    // ███    ███
    //   █    █
    //   █    █
    const angerPattern = [
      [0, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0],
      [1, 1, 1, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0, 1, 1, 1],
      [0, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0],
    ];

    const patternSize = 9;

    for (const mark of this.angerMarks) {
      ctx.save();
      ctx.globalAlpha = mark.opacity;

      const mx = mark.x - (patternSize * ps) / 2;
      const my = mark.y - (patternSize * ps) / 2;

      for (let row = 0; row < patternSize; row++) {
        for (let col = 0; col < patternSize; col++) {
          if (angerPattern[row][col] === 1) {
            ctx.fillStyle = "#ff4444";
            ctx.fillRect(mx + col * ps, my + row * ps, ps, ps);
          }
        }
      }

      ctx.restore();
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.hitArea && this.hitArea.parentNode) {
      this.hitArea.parentNode.removeChild(this.hitArea);
      this.hitArea = null;
    }
  }
}
