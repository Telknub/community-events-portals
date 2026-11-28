import React from "react";
import { PuzzleProps } from "./PuzzleFrame";

// Original puzzles
import { SudokuPuzzle } from "./SudokuPuzzle";
import { SlidingPuzzle } from "./SlidingPuzzle";
import { JigsawPuzzle } from "./JigsawPuzzle";
import { PipePuzzle } from "./PipePuzzle";
import { NonogramPuzzle } from "./NonogramPuzzle";

// New puzzles
import { UnblockPuzzle } from "./UnblockPuzzle";
import { IcePuzzle } from "./IcePuzzle";
import { SokobanPuzzle } from "./SokobanPuzzle";
import { LaserPuzzle } from "./LaserPuzzle";
import { CopyPatternPuzzle } from "./CopyPatternPuzzle";
import { Sum10Puzzle } from "./Sum10Puzzle";
import { SequencePuzzle } from "./SequencePuzzle";
import { OddOnePuzzle } from "./OddOnePuzzle";
import { MagicSquarePuzzle } from "./MagicSquarePuzzle";

/**
 * Single list of every puzzle component, keyed by the names in PUZZLE_TYPES (Constants.ts).
 * Handy for the free-play mode: Object.keys(PUZZLE_COMPONENTS) is the puzzle menu.
 * Render with `key={`${type}-${difficulty}`}` so a difficulty change regenerates the board.
 */
export const PUZZLE_COMPONENTS: Record<string, React.FC<PuzzleProps>> = {
  sudoku: SudokuPuzzle,
  sliding: SlidingPuzzle,
  jigsaw: JigsawPuzzle,
  pipe: PipePuzzle,
  nonogram: NonogramPuzzle,

  unblock: UnblockPuzzle,
  ice: IcePuzzle,
  sokoban: SokobanPuzzle,
  laser: LaserPuzzle,
  copypattern: CopyPatternPuzzle,
  sum10: Sum10Puzzle,
  sequence: SequencePuzzle,
  oddone: OddOnePuzzle,
  magicsquare: MagicSquarePuzzle,
};
