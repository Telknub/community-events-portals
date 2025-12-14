import { Equipped } from "features/game/types/bumpkin";
import { translate as t } from "lib/i18n/translate";
import { NPC_WEARABLES } from "lib/npcs";
import { ITEM_DETAILS } from "features/game/types/images";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import confetti from "canvas-confetti";

import slidingPuzzle1 from "public/world/portal/images/slidingPuzzle1.webp";

import lighthouse from "public/world/portal/images/lighthouse.png";
import point from "public/world/portal/images/point.png";
import resetBtn from "public/world/portal/images/resetbutton_normal.webp";

export const PORTAL_NAME = "christmas";
export const PORTAL_TOKEN = "Christmas Token 2025";

// Game config
export const GAME_SECONDS = 300;
export const GAME_LIVES = 5;

// Player
export const WALKING_SPEED = 50;

// Attempts
export const INITIAL_DATE = "2025-10-28"; // YYYY-MM-DD
export const INITIAL_DATE_LEADERBOARD = "2025-10-29"; // YYYY-MM-DD
export const ATTEMPTS_BETA_TESTERS = 100;
export const UNLIMITED_ATTEMPTS_SFL = 150; // If this value is less than 0, the option disappears
export const FREE_DAILY_ATTEMPTS = 1;
export const RESTOCK_ATTEMPTS = [
  { attempts: 1, sfl: 3 },
  { attempts: 3, sfl: 7 },
  { attempts: 7, sfl: 14 },
  { attempts: 20, sfl: 30 },
];

// Beta testers
// export const BETA_TESTERS: number[] = [
//   29, 9609, 49035, 155026, 1181, 151471, 49035, 86, 79871, 2299, 21303, 206876,
//   9239, 36214, 55626, 3249, 128122,
// ];
export const BETA_TESTERS: number[] = [];

// Puzzle
export const PUZZLE_POINTS_CONFIG = [
  { x: 313, y: 466, difficulty: "easy" },
  { x: 380, y: 466, difficulty: "easy" },
  { x: 457, y: 450, difficulty: "hard" },
  { x: 432, y: 368, difficulty: "hard" },
  { x: 345, y: 367, difficulty: "hard" },
];
export const PATH_PUZZLE_POINTS = [
  [{ x: PUZZLE_POINTS_CONFIG[0].x, y: PUZZLE_POINTS_CONFIG[0].y }],
  [{ x: PUZZLE_POINTS_CONFIG[1].x, y: PUZZLE_POINTS_CONFIG[1].y - 3 }],
  [
    { x: 416, y: 452 },
    { x: PUZZLE_POINTS_CONFIG[2].x, y: PUZZLE_POINTS_CONFIG[2].y - 3 },
  ],
  [
    { x: 452, y: 377 },
    { x: PUZZLE_POINTS_CONFIG[3].x, y: PUZZLE_POINTS_CONFIG[3].y - 3 }
  ],
  [{ x: PUZZLE_POINTS_CONFIG[4].x, y: PUZZLE_POINTS_CONFIG[4].y - 3 }],
]
export const PUZZLE_TYPES = ["sudoku", "sliding", "jigsaw", "pipe", "nonogram"];
export type PuzzleName = (typeof PUZZLE_TYPES)[number];
export const MAX_PUZZLES = 5;
export const PUZZLE_TIMES: Record<PuzzleName, Record<string, number>> = {
  sudoku: {
    easy: 45,
    hard: 60,
  },
  sliding: {
    easy: 45,
    hard: 60,
  },
  jigsaw: {
    easy: 45,
    hard: 60,
  },
  pipe: {
    easy: 45,
    hard: 60,
  },
  nonogram: {
    easy: 45,
    hard: 60,
  },
};

// Puzzle config
export const POWER_DISPLAY_SCORE = 2;
export const RESET_ATTEMPTS = 3;
export const VICTORY_TEXT = {
  Sudoku: "You've uncovered the Owl's secret!",
  SlidingPuzzle: "The Owl watches, puzzle complete!",
};

// Jigsaw puzzle
export const JIGSAW_PUZZLE_DIFFICULTY = { easy: 8, hard: 4 };

// Sudoku puzzle
export const SUDOKU_DIFFICULTY = {
  easy: 4,
  hard: 6,
};

// Sliding Puzzle
export const SLIDING_PUZZLE_DIFFICULTY = { easy: 4, hard: 8 };
export const SLIDING_PUZZLE_IMG = slidingPuzzle1;

// Guide
export const INSTRUCTIONS: {
  image: string;
  description: string;
  width?: number;
}[] = [
  {
    image: lighthouse,
    description: t(`${PORTAL_NAME}.resource1`),
  },
  {
    image: point,
    description: t(`${PORTAL_NAME}.resource2`),
  },
  {
    image: resetBtn,
    description: t(`${PORTAL_NAME}.resource3`),
  },
];

export const RESOURCES_TABLE: {
  image: string;
  description: string;
  width?: number;
}[] = [
    {
      image: ITEM_DETAILS["Abandoned Bear"].image,
      description: t(`${PORTAL_NAME}.resource1`),
    },
    {
      image: ITEM_DETAILS["Abandoned Bear"].image,
      description: t(`${PORTAL_NAME}.resource2`),
    },
    {
      image: ITEM_DETAILS["Abandoned Bear"].image,
      description: t(`${PORTAL_NAME}.resource3`),
    },
  ];

export const ENEMIES_TABLE: {
  image: string;
  description: string;
  width?: number;
}[] = [
    {
      image: ITEM_DETAILS["Abandoned Bear"].image,
      description: t(`${PORTAL_NAME}.enemy1`),
    },
    {
      image: ITEM_DETAILS["Abandoned Bear"].image,
      description: t(`${PORTAL_NAME}.enemy2`),
    },
  ];

// Panel
export const PANEL_NPC_WEARABLES: Equipped = NPC_WEARABLES["elf"];

// Snow effect
export const SNOW = () => {
  confetti();
  const duration = 15 * 1000;
  const animationEnd = Date.now() + duration;
  let skew = 1;

  function randomInRange(min: number, max: number) {
    return Math.random() * (min - max) + min;
  }

  (function frame() {
    const timeLeft = animationEnd - Date.now();
    const ticks = Math.max(200, 500 * (timeLeft / duration));
    skew = Math.max(0.8, skew - 0.001);

    confetti({
      particleCount: 1,
      startVelocity: 0,
      ticks,
      origin: {
        x: Math.random(),
        y: Math.random() * skew - 0.2,
      },
      colors: ["#ffffff"],
      shapes: ["circle"],
      gravity: randomInRange(0.4, 0.6),
      scalar: randomInRange(0.8, 2),
      drift: randomInRange(-0.4, 0.4),
    });

    if (timeLeft > 0) {
      requestAnimationFrame(frame);
    }
  })();
};

// Nonogram Patterns 6x6
export type Cell = 0 | 1;
type pattern = Cell[][];

export const NONOGRAM_PATTERNS_EASY: Record<string, pattern> = {
  christmas_tree: [
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
  ],
  arrow_up: [
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
  ],
  heart: [
    [0, 0, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1],
  ],
  smiley: [
    [0, 1, 0, 0, 1, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0],
  ],
  diamond: [
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0],
  ],
  star: [
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 0],
  ],
};

export const NONOGRAM_PATTERNS_HARD: Record<string, pattern> = {
  flower: [
    [0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
  ],
  x_shape: [
    [1, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1],
  ],
  moon: [
    [0, 0, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 1],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 1],
    [0, 0, 1, 1, 1, 0],
  ],
  circle: [
    [0, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 0],
  ],
}