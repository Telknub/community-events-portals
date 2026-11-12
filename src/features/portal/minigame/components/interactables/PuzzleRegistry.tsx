import React from "react";
import { PuzzleProps } from "./PuzzleFrame";

// Original puzzles
import { SudokuPuzzle } from "./SudokuPuzzle";
import { SlidingPuzzle } from "./SlidingPuzzle";
import { JigsawPuzzle } from "./JigsawPuzzle";
import { PipePuzzle } from "./PipePuzzle";
import { NonogramPuzzle } from "./NonogramPuzzle";

// New puzzles
import { LightsOutPuzzle } from "./LightsOutPuzzle";
import { ColorSortPuzzle } from "./ColorSortPuzzle";
import { CodebreakerPuzzle } from "./CodebreakerPuzzle";
import { FlowPuzzle } from "./FlowPuzzle";
import { UnblockPuzzle } from "./UnblockPuzzle";
import { IcePuzzle } from "./IcePuzzle";
import { SokobanPuzzle } from "./SokobanPuzzle";
import { FloodPuzzle } from "./FloodPuzzle";
import { RingsPuzzle } from "./RingsPuzzle";
import { JugsPuzzle } from "./JugsPuzzle";
import { LaserPuzzle } from "./LaserPuzzle";
import { TangramPuzzle } from "./TangramPuzzle";
import { CopyPatternPuzzle } from "./CopyPatternPuzzle";
import { Sum10Puzzle } from "./Sum10Puzzle";
import { EquationPuzzle } from "./EquationPuzzle";
import { SequencePuzzle } from "./SequencePuzzle";
import { OddOnePuzzle } from "./OddOnePuzzle";
import { TraceMazePuzzle } from "./TraceMazePuzzle";
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

  lightsout: LightsOutPuzzle,
  colorsort: ColorSortPuzzle,
  codebreaker: CodebreakerPuzzle,
  flow: FlowPuzzle,
  unblock: UnblockPuzzle,
  ice: IcePuzzle,
  sokoban: SokobanPuzzle,
  floodit: FloodPuzzle,
  rings: RingsPuzzle,
  jugs: JugsPuzzle,
  laser: LaserPuzzle,
  tangram: TangramPuzzle,
  copypattern: CopyPatternPuzzle,
  sum10: Sum10Puzzle,
  equation: EquationPuzzle,
  sequence: SequencePuzzle,
  oddone: OddOnePuzzle,
  tracemaze: TraceMazePuzzle,
  magicsquare: MagicSquarePuzzle,
};
