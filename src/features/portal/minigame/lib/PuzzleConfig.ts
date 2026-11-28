/**
 * Config for the NEW puzzles (times, difficulty tables, placeholder texts).
 * No imports on purpose: Constants.ts imports this file, so this one must not import Constants.
 *
 * Every table below is indexed by "level":
 *   0 = easy, 1 = medium, 2 = hard 1, 3 = hard 2, 4 = hard 3, 5 = hard 4
 */

export const LEVELS = [
  "easy",
  "medium",
  "hard 1",
  "hard 2",
  "hard 3",
  "hard 4",
];
export const levelOf = (difficulty: string): number =>
  Math.max(0, LEVELS.indexOf(difficulty));

/**
 * Display names. The internal keys ("hard 1" ... "hard 4") are used by PUZZLE_TIMES,
 * the difficulty tables and the state machine, so only what the player SEES changes.
 * TODO: move to i18n.
 */
export const DIFFICULTY_NAMES: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  "hard 1": "Hard",
  "hard 2": "Expert",
  "hard 3": "Master",
  "hard 4": "Insane",
};
/** Free play: points for the FIRST completion of a puzzle at each difficulty (+1 per step). */
export const DIFFICULTY_POINTS: Record<string, number> = {
  easy: 1,
  medium: 2,
  "hard 1": 3,
  "hard 2": 4,
  "hard 3": 5,
  "hard 4": 6,
};
export const difficultyPoints = (difficulty: string): number =>
  DIFFICULTY_POINTS[difficulty] ?? 1;

export const difficultyName = (difficulty: string): string =>
  DIFFICULTY_NAMES[difficulty] ?? difficulty;

export const NEW_PUZZLE_TYPES = [
  "unblock",
  "ice",
  "sokoban",
  "laser",
  "copypattern",
  "sum10",
  "sequence",
  "oddone",
  "magicsquare",
];

const times = (...v: number[]): Record<string, number> =>
  LEVELS.reduce(
    (acc, level, i) => ({ ...acc, [level]: v[i] }),
    {} as Record<string, number>,
  );

// Seconds available per level. TODO: tune after playtesting.
export const NEW_PUZZLE_TIMES: Record<string, Record<string, number>> = {
  unblock: times(70, 65, 65, 60, 60, 60),
  ice: times(45, 45, 45, 45, 40, 40),
  sokoban: times(75, 70, 70, 65, 65, 60),
  laser: times(45, 45, 45, 45, 45, 45),
  copypattern: times(45, 45, 45, 45, 40, 40),
  sum10: times(60, 60, 60, 55, 55, 55),
  sequence: times(45, 45, 45, 40, 40, 40),
  oddone: times(45, 45, 45, 45, 40, 40),
  magicsquare: times(75, 70, 65, 75, 70, 65),
};

// ---------------------------------------------------------------------------
// Difficulty tables (index = level)
// ---------------------------------------------------------------------------

// min / max = allowed range for the shortest solution (in moves)
export const UNBLOCK = [
  { cars: 5, min: 3, max: 5 },
  { cars: 6, min: 4, max: 6 },
  { cars: 7, min: 5, max: 8 },
  { cars: 8, min: 7, max: 10 },
  { cars: 8, min: 8, max: 11 },
  { cars: 9, min: 10, max: 13 },
];

export const ICE = [
  { size: 5, rocks: 5, min: 3, max: 5 },
  { size: 6, rocks: 8, min: 4, max: 6 },
  { size: 6, rocks: 9, min: 5, max: 7 },
  { size: 7, rocks: 12, min: 6, max: 8 },
  { size: 7, rocks: 13, min: 7, max: 9 },
  { size: 8, rocks: 16, min: 8, max: 11 },
];

// steps = length of the random "reverse" walk that scrambles the board
export const SOKOBAN = [
  { size: 5, boxes: 1, steps: 25 },
  { size: 5, boxes: 2, steps: 40 },
  { size: 6, boxes: 2, steps: 60 },
  { size: 6, boxes: 3, steps: 80 },
  { size: 7, boxes: 3, steps: 100 },
  { size: 7, boxes: 4, steps: 130 },
];

export const LASER = [
  { size: 5, turns: 2, decoys: 1 },
  { size: 5, turns: 3, decoys: 2 },
  { size: 6, turns: 3, decoys: 3 },
  { size: 6, turns: 4, decoys: 3 },
  { size: 7, turns: 4, decoys: 4 },
  { size: 7, turns: 5, decoys: 5 },
];

// show = milliseconds the pattern stays visible
export const COPY_PATTERN = [
  { size: 3, lit: 3, show: 3000 },
  { size: 3, lit: 4, show: 3000 },
  { size: 4, lit: 5, show: 3000 },
  { size: 4, lit: 6, show: 2500 },
  { size: 5, lit: 8, show: 3000 },
  { size: 5, lit: 9, show: 2500 },
];

export const SUM10 = [
  { w: 4, h: 4 },
  { w: 5, h: 4 },
  { w: 5, h: 5 },
  { w: 6, h: 5 },
  { w: 6, h: 6 },
  { w: 7, h: 6 },
];

export const SEQUENCE = [
  { rounds: 2 },
  { rounds: 2 },
  { rounds: 3 },
  { rounds: 3 },
  { rounds: 3 },
  { rounds: 3 },
];

// delta = hue / rotation difference (smaller = harder)
export const ODD_ONE = [
  { size: 3, rounds: 2, delta: 60, kinds: ["shape"] },
  { size: 3, rounds: 3, delta: 45, kinds: ["shape", "hue"] },
  { size: 4, rounds: 3, delta: 30, kinds: ["hue"] },
  { size: 4, rounds: 3, delta: 22, kinds: ["hue", "rot"] },
  { size: 5, rounds: 3, delta: 16, kinds: ["hue", "rot"] },
  { size: 5, rounds: 4, delta: 12, kinds: ["hue", "rot"] },
];

export const MAGIC_SQUARE = [
  { n: 3, givens: 5 },
  { n: 3, givens: 4 },
  { n: 3, givens: 3 },
  { n: 4, givens: 11 },
  { n: 4, givens: 10 },
  { n: 4, givens: 9 },
];

// ---------------------------------------------------------------------------
// Shared palette
// ---------------------------------------------------------------------------
export const PUZZLE_COLORS = [
  "#e43b44", // red
  "#0099db", // blue
  "#63c74d", // green
  "#feae34", // yellow
  "#b55088", // purple
  "#f77622", // orange
  "#2ce8f5", // cyan
  "#8b9bb4", // gray
];

// ---------------------------------------------------------------------------
// Placeholder texts. TODO: move to i18n (`${PORTAL_NAME}.<key>`) when ready.
// ---------------------------------------------------------------------------
export const PUZZLE_TEXTS: Record<string, { title: string; hint: string }> = {
  unblock: {
    title: "Unblock",
    hint: "Tap a car, then a dot to slide it. Free the red car through the exit.",
  },
  ice: {
    title: "Ice Slide",
    hint: "You slide until you hit a rock or the wall. Reach the star!",
  },
  sokoban: {
    title: "Gift Pusher",
    hint: "Push every gift onto a target. You can only push, never pull.",
  },
  laser: {
    title: "Laser & Mirrors",
    hint: "Tap the mirrors to flip them and guide the beam to the star.",
  },
  copypattern: {
    title: "Copy the Pattern",
    hint: "Memorise the lit tiles, then recreate the pattern from memory.",
  },
  sum10: {
    title: "Sum 10",
    hint: "Drag a rectangle whose numbers add up to 10 to clear it. Clear the board!",
  },
  sequence: {
    title: "Next in Sequence",
    hint: "Find the number that continues the sequence.",
  },
  oddone: {
    title: "Odd One Out",
    hint: "Find the tile that is different from the others.",
  },
  magicsquare: {
    title: "Magic Square",
    hint: "Every row, column and diagonal must add up to the same number. Use each number once.",
  },
};
